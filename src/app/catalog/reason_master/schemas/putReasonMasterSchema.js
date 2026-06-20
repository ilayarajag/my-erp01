const { errorSchemas } = require("../../../commons/schemas/errorSchemas");

const putReasonMasterSchema = {
  tags: ["Reason Master"],
  summary: "Update Reason Master",
  headers: { $ref: "request-headers#" },
  params: {
    type: "object",
    required: ["reason_id"],
    properties: {
      reason_id: { type: "integer" }
    }
  },
  body: {
    type: "object",
    properties: {
      reason_name: { type: "string" },
      reason: { type: "string" },
      reason_type: { type: "string" },
      outlet_ids: { type: "array", items: { type: "integer" } },
      active: { type: "boolean" }
    }
  },
  response: {
    200: {
      type: "object",
      properties: {
        success: { type: "boolean" }
      }
    },
    ...errorSchemas
  }
};

module.exports = putReasonMasterSchema;
