import camelcase from "camelcase";

const AttributeTypes = {
  STRING: "string",
  INTEGER: "integer",
  DOUBLE: "double",
  BOOLEAN: "boolean",
  DATETIME: "datetime",
  RELATIONSHIP: "relationship",
};

const FormatTypes = {
  ENUM: "enum",
  EMAIL: "email",
  URL: "url",
};

export class Typescript {
  static getCamelCase(input) {
    return camelcase(input, { pascalCase: true });
  }

  static getType(attribute) {
    const getPrimitive = (type) => {
      switch (type) {
        case AttributeTypes.STRING:
          return "string";
        case AttributeTypes.INTEGER:
          return "number";
        case AttributeTypes.DOUBLE:
          return "number";
        case AttributeTypes.BOOLEAN:
          return "boolean";
        case AttributeTypes.DATETIME:
          return "Date";
        default:
          return "unknown";
      }
    };

    switch (attribute.format) {
      case FormatTypes.ENUM:
        return Typescript.getEnumFormatted(attribute);
      default:
        return getPrimitive(attribute.type);
    }
  }

  static getEnumFormatted({ collection, name }) {
    return Typescript.getCamelCase(collection) + Typescript.getCamelCase(name);
  }

  static getTypeFormatted({ name }) {
    return Typescript.getCamelCase(name);
  }

  static getRelationshipType(attribute) {
    if (!attribute.relation) return "unknown";

    const baseType = Typescript.getCamelCase(attribute.relation);

    switch (attribute.relationType) {
      case "oneToOne":
      case "manyToOne":
        return baseType;
      case "oneToMany":
      case "manyToMany":
        return `${baseType}[]`;
      default:
        return "unknown";
    }
  }

  getFileExtension() {
    return ".d.ts";
  }
}
