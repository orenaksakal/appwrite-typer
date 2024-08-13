import camelcase from "camelcase";

const AttributeTypes = {
  STRING: "string",
  INTEGER: "integer",
  DOUBLE: "double",
  BOOLEAN: "boolean",
  DATETIME: "datetime",
  RELATIONSHIP: "relationship",
};

export class Typescript {
  static getType(type) {
    console.log({ type });
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
      case AttributeTypes.RELATIONSHIP:
        return type;
      default:
        return "unknown";
    }
  }

  static getTypeFormatted(name) {
    return camelcase(name, { pascalCase: true });
  }

  static getRelationshipType(attribute) {
    if (!attribute.relation) return 'unknown';
    
    const baseType = Typescript.getTypeFormatted(attribute.relation);
    
    switch (attribute.relationType) {
      case 'oneToOne':
      case 'manyToOne':
        return baseType;
      case 'oneToMany':
      case 'manyToMany':
        return `${baseType}[]`;
      default:
        return 'unknown';
    }
  }

  getTypeDefault(attribute) {
    if (!attribute.required) {
      return "null";
    }
    if (attribute.array) {
      return "[]";
    }

    switch (attribute.type) {
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
    }
  }

  getFileExtension() {
    return ".d.ts";
  }
}
