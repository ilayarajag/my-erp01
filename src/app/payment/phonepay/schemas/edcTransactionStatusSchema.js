const { errorSchemas } = require("../../../commons/schemas/errorSchemas");

const edcTransactionStatusSchema = {
  tags: ["PhonePe EDC"],
  summary: "Check EDC transaction status via PhonePe BFF and update outlet_payment_logs",
  headers: { $ref: "request-headers#" },
  params: {
    type: "object",
    required: ["transactionId"],
    properties: {
      transactionId: { type: "string" }
    }
  },
  response: {
    200: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        payment_status: { type: "string" },
        // data: { type: "object", additionalProperties: true }
      }
    },
    ...errorSchemas
  }
};

module.exports = edcTransactionStatusSchema;
