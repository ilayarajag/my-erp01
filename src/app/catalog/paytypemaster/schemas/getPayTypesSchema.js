const { errorSchemas } = require("../../../commons/schemas/errorSchemas");

const getPayTypesSchema = {
  tags: ["PAY TYPE"],
  summary: "Get Pay Types List",
  headers: { $ref: "request-headers#" },

  queryString: {
    type: "object",
    additionalProperties: false,
    properties: {
      status: { type: "integer", enum: [0, 1, 2], default: 0 }, // 0 all, 1 active, 2 inactive
      search: { type: "string", default: "" }
    }
  },

  response: {
    200: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "integer" },
          pay_type_name: { type: "string" },
          pay_type_key: { type: "string" },
          is_active: { type: "boolean" },
          created_at: { type: "string" }
        }
      }
    },

    ...errorSchemas
  }
};

module.exports = getPayTypesSchema;