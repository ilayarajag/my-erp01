const { type } = require("os");
const { errorSchemas } = require("../../../commons/schemas/errorSchemas");
const { LENGTH_REQUIRED } = require("http-status-codes");

const getReasonOutletsByRegionSchema = {
  tags: ["Reason Master"],
  summary: "Get active outlets by region for reason master mapping",
  headers: { $ref: "request-headers#" },
  response: {
    200: {
      type: "object",
      additionalProperties: {
        type: "array",
        items: {
          type: "object",
          properties: {
            outlet_id: { type: "integer" },
            outlet_name: { type: "string" },
            store_code: { type: "string" },
            region: { type: "string" }
          }
        }
      }
    },
    ...errorSchemas
  }
};

module.exports = getReasonOutletsByRegionSchema;
