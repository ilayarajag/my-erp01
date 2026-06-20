const { errorSchemas } = require("../../../commons/schemas/errorSchemas");

const getStoreManagerInfoSchema = {
  tags: ["Store Manager"],
  summary: "Get Store Manager by Outlet ID",
  params: {
    type: "object",
    required: ["outlet_id"],
    properties: {
      outlet_id: { type: "integer" }
    }
  },
  response: {
    200: {
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
    },
    ...errorSchemas
  }
};

module.exports = getStoreManagerInfoSchema;
