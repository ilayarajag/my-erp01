const { errorSchemas } = require("../../../commons/schemas/errorSchemas");

const getParentChildConversionInfoSchema = {
  tags: ["Parent Child Conversion"],
  summary: "Get single parent child conversion info",
  headers: { $ref: "request-headers#" },
  params: {
    type: "object",
    required: ["parent_child_conv_id"],
    properties: {
      parent_child_conv_id: { type: "integer" }
    }
  },
  response: {
    200: {
      type: "object",
      properties: {
        id: { type: "integer" },
        parent_code: { type: "number" },
        parent_name: { type: "string" },
        child_code: { type: "number" },
        child_name: { type: "string" },
        quantity: { type: "number" },
        outlet_ids: { type: "array", items: { type: "integer" } },
        created_at: { type: "string" },
        updated_at: { type: "string" }
      }
    },
    ...errorSchemas
  }
};

module.exports = getParentChildConversionInfoSchema;
