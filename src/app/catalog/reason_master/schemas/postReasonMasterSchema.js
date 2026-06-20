const { errorSchemas } = require("../../../commons/schemas/errorSchemas");

const postReasonMasterSchema = {
  tags: ["Reason Master"],
  summary: "Create Reason Master",
  headers: { $ref: "request-headers#" },
  body: {
    type: "object",
    required: ["reason_name", "reason", "reason_type", "active", "outlet_ids"],
    properties: {
      reason_name: { type: "string" },
      reason: { type: "string" },
      reason_type: { type: "string" },
      outlet_ids: {
        type: "array",
        items: {
          type: "integer"
        }
      },
      active: { type: "boolean" }
    }
  },
  response: {
    200: {
      type: "object",
      properties: { success: { type: "boolean" } }
    },
    ...errorSchemas
  }
};

module.exports = postReasonMasterSchema;
