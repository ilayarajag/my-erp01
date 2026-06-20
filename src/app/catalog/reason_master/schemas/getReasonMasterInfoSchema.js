const { errorSchemas } = require("../../../commons/schemas/errorSchemas");

const getReasonMasterInfoSchema = {
  tags: ["Reason INFO"],
  summary: "This API is to fetch reason master info",
  headers: { $ref: "request-headers#" },
  params: {
    type: "object",
    properties: {
      reason_id: { type: "integer" }
    }
  },
  response: {
    200: {
      type: "object",
      properties: {
        id: { type: "integer" },
        reason: { type: "string" },
        reason_name: { type: "string" },
        reason_type: { type: "string" },
        active: { type: "boolean" },
        outlet_ids: {
          type: "array",
          items: {
            type: "integer"
          }
        }
      }
    },

    ...errorSchemas
  }
};

module.exports = getReasonMasterInfoSchema;
