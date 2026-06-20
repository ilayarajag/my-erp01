const { errorSchemas } = require("../../../commons/schemas/errorSchemas");

const postParentChildConversionSchema = {
  tags: ["Parent Child Conversion"],
  summary: "Create parent child conversions (bulk)",
  headers: { $ref: "request-headers#" },
  body: {
    type: "object",
    required: ["data"],
    properties: {
      data: {
        type: "array",
        minItems: 1,
        items: {
          type: "object",
          required: ["parent_code", "child_code", "quantity","outlet_ids"],
          properties: {
            parent_code: { type: "number" },
            child_code: { type: "number" },
            quantity: { type: "number"},
            outlet_ids: { type: "array", items: { type: "integer" } }
          }
        }
      }
    }
  },
  response: {
    200: {
      type: "object",
      properties: { success: { type: "boolean" } }
    },
    ...errorSchemas
  }
};

module.exports = postParentChildConversionSchema;
