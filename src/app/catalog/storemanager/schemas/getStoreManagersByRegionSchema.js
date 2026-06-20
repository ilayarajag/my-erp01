const { errorSchemas } = require("../../../commons/schemas/errorSchemas");

const getStoreManagersByRegionSchema = {
  tags: ["Store Manager"],
  summary: "Get store manager details by region with pagination",
  params: {
    type: "object",
    required: ["region_id", "page_size", "current_page"],
    properties: {
      region_id: { type: "integer" },
      page_size: { type: "integer", minimum: 1 },
      current_page: { type: "integer", minimum: 1 }
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
              store_code: { type: "string" },
              sm_name: { type: "string" },
              sm_mobile: { type: "string" },
              outlet_id: { type: "integer" },
              outlet_name: { type: "string" }
            }
          }
        },
        meta: { $ref: "response-meta#" }
      }
    },
    ...errorSchemas
  }
};

module.exports = getStoreManagersByRegionSchema;
