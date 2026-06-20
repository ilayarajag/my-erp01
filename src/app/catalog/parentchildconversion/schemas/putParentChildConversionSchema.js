const { errorSchemas } = require("../../../commons/schemas/errorSchemas");

const putParentChildConversionSchema = {
  tags: ["Parent Child Conversion"],
  summary: "Update parent child conversion",
  headers: { $ref: "request-headers#" },
  params: {
    type: "object",
    required: ["parent_child_conv_id"],
    properties: {
      parent_child_conv_id: { type: "integer" }
    }
  },
  body: {
    type: "object",
    properties: {
      parent_code: { type: "number" },
      child_code: { type: "number" },
      quantity: { type: "number", minimum: 0.0001 },
      outlet_ids: { type: "array", items: { type: "integer" } }
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

module.exports = putParentChildConversionSchema;
