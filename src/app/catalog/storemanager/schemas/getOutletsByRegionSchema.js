const { errorSchemas } = require("../../../commons/schemas/errorSchemas");

const getOutletsByRegionSchema = {
  tags: ["Store Manager"],
  summary: "Get outlets with store manager by region",
  params: {
    type: "object",
    required: ["region_id"],
    properties: {
      region_id: { type: "integer" }
    }
  },
  response: {
    200: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "integer" },
          outlet_name: { type: "string" },
          bankid: { type: "string" }
        }
      }
    },
    ...errorSchemas
  }
};

module.exports = getOutletsByRegionSchema;
