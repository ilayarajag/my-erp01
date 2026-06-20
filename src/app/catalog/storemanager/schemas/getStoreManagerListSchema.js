const { errorSchemas } = require("../../../commons/schemas/errorSchemas");

const getStoreManagerListSchema = {
  tags: ["Store Manager"],
  summary: "Get Store Manager List with Pagination",
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
              outlet_id: { type: "integer" },
              outlet_name: { type: "string" },
              outlet_full_name: { type: "string" },
              store_code: { type: "string" },
              sm_name: { type: "string" },
              sm_mobile: { type: "string" },
              status: { type: "boolean" },
              created_at: { type: "string" },
              updated_at: { type: "string" }
            }
          }
        },
        meta: { $ref: "response-meta#" }
      }
    },
    ...errorSchemas
  }
};

module.exports = getStoreManagerListSchema;
