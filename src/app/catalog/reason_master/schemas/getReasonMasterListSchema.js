const { errorSchemas } = require("../../../commons/schemas/errorSchemas");

const getReasonMasterListSchema = {
  tags: ["Reason Master"],
  summary: "Get Reason Master List with pagination and filters",
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
              reason: { type: "string" },
              reason_name: { type: "string" },
              active: { type: "boolean" },
              outlet_id: { type: "integer" },
              outlet_name: { type: "string" },
              store_code: { type: "string" },
              region: { type: "string" }
            }
          }
        },
        meta: { $ref: "response-meta#" }
      }
    },
    ...errorSchemas
  }
};

module.exports = getReasonMasterListSchema;
