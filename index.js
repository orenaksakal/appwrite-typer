#!/usr/bin/env node

import yargs from "yargs";
import path, { dirname } from "path";
import { Client, Databases } from "node-appwrite";
import { hideBin } from "yargs/helpers";
import { mkdir, readFile, appendFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { exit } from "process";
import { Typescript } from "./typescript.js";
import { renderFile } from "ejs";
import { fileURLToPath } from "url";

/**
 * Load configuration for Appwrite and initialize client and database.
 * @param {string} file
 * @returns {Promise<{config: object, client: Client, database: Databases}>}
 */
const loadConfigurationAndInitialize = async (file) => {
  try {
    if (!existsSync(file)) {
      onError("Configuration not found.");
    }

    const data = await readFile(file, "utf8");
    const config = JSON.parse(data);

    const client = new Client();
    client
      .setEndpoint(config.endpoint)
      .setProject(config.projectId)
      .setKey(config.apiKey);

    const database = new Databases(client);

    return { config, client, database };
  } catch (err) {
    onError(err.message);
  }
};

const generate = async ({ output, config, language }) => {
  const { config: configVariables, database } = await loadConfigurationAndInitialize(config);
  const lang = new Typescript();

  /** @type {Array<object>} collections*/
  const collections = (await database.listCollections(configVariables.databaseId))
    .collections;
  const types = buildCollectionTypes(collections);

  if (!existsSync(output)) {
    await mkdir(output, { recursive: true });
  }

  const destination = path.join(output, `appwrite${lang.getFileExtension()}`);
  const imp = 'import type { Models } from "appwrite";\n\n';

  await writeFile(destination, imp);

  for (const type of types) {
    try {
      const content = await renderFile(
        path.join(
          fileURLToPath(dirname(import.meta.url)),
          `./template.ejs`
        ),
        {
          ...type,
          getType: Typescript.getType,
          getTypeFormatted: Typescript.getTypeFormatted,
          getRelationshipType: Typescript.getRelationshipType
        }
      );

      await appendFile(destination, content + "\n\n");
      console.log(`Generated ${destination} for ${type.name}`);
    } catch (err) {
      console.error(err.message);
    }
  }
};

const buildCollectionTypes = (collections) => {
  let types = [];

  collections.forEach((collection) => {
    types.push({
      name: collection.name,
      attributes: collection?.attributes
        ?.map((rule) => {
          const isRelation = collections.find(
            (item) => item.$id === rule.relatedCollection
          );
          return {
            name: rule.key,
            type: rule.type,
            array: rule.array,
            required: rule.required,
            relationType: rule.relationType,
            relation: isRelation
              ? Typescript.getTypeFormatted(isRelation?.name)
              : null,
          };
        })
        .sort((a, b) => {
          return a.required === b.required ? 0 : a.required ? -1 : 1;
        }),
    });
  });

  return types;
};

const onError = function catchError(error) {
  console.error(error);
  exit(1);
};

yargs(hideBin(process.argv))
  .command(
    "generate",
    "Fetches Collection and creates Typescript Definitions",
    () => {},
    generate
  )
  .option("output", {
    alias: "o",
    type: "string",
    description: "Output",
    default: "./",
  })
  .option("config", {
    alias: "c",
    type: "string",
    description: "Configuration file.",
    required: true,
  })
  .demandCommand(1).argv;
