#!/usr/bin/env node

import yargs from "yargs";
import path, { dirname } from "path";
import sdk from "node-appwrite";
import { hideBin } from "yargs/helpers";
import { mkdir, readFile, appendFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { exit } from "process";
import { Typescript } from "./typescript.js";
import { renderFile } from "ejs";
import { fileURLToPath } from "url";

const client = new sdk.Client();
const database = new sdk.Databases(client);

/**
 * Load configuration for Appwrite.
 * @param {string} file
 * @returns {Promise<object>}
 */
const loadConfiguration = async (file) => {
  try {
    if (!existsSync(file)) {
      onError("Configuration not found.");
    }

    const data = await readFile(file, "utf8");
    const config = JSON.parse(data);

    client
      .setEndpoint(config.endpoint)
      .setProject(config.projectId)
      .setKey(config.apiKey);

    return config;
  } catch (err) {
    onError(err.message);
  }
};

const generate = async ({ output, config, language }) => {
  const configVariables = await loadConfiguration(config);
  const lang = new Typescript();

  /** @type {Array<object>} collections*/
  const collections = (await database.listCollections(configVariables.databaseId))
    .collections;
  const types = buildCollectionTypes(collections);

  if (!existsSync(output)) {
    await mkdir(output, { recursive: true });
  }

  const destination = path.join(output, `./appwrite${lang.getFileExtension()}`);
  const imp = 'import type { Models } from "appwrite";\n';

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
        }
      );

      await appendFile(destination, content + "\n");
      console.log(`Generated ${destination}`);
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
