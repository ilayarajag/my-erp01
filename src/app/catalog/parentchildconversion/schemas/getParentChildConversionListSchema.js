const { errorSchemas } = require("../../../commons/schemas/errorSchemas");

const getParentChildConversionListSchema = {
  tags: ["Parent Child Conversion"],
  summary: "Get parent child conversion list with pagination and search",
  headers: { $ref: "request-headers#" },
  params: {
    type: "object",
    required: ["page_size", "current_page"],
    properties: {
      page_size: { type: "integer", minimum: 1 },
      current_page: { type: "integer", minimum: 1 }
    }
  },
  querystring: {
    type: "object",
    properties: {
      search: { type: "string" },
      region_id: { type: "integer" },
      outlet_id: { type: "integer" }
    }
  },
  response: {
    200: {
      type: "object",
      properties: {
        data: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "integer" },
              outlet_id: { type: "integer" },
              outlet_name: { type: "string" },
              store_code: { type: "string" },
              region: { type: "string" },
              parent_code: { type: "number" },
              parent_name: { type: "string" },
              child_code: { type: "number" },
              child_name: { type: "string" },
              quantity: { type: "number" },
              user_name: { type: "string" }
            }
          }
        },
        meta: { $ref: "response-meta#" }
      }
    },
    ...errorSchemas
  }
};

module.exports = getParentChildConversionListSchema;
