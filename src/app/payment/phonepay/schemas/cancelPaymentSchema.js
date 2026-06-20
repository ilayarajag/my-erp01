const { errorSchemas } = require("../../../commons/schemas/errorSchemas");

const cancelPaymentSchema = {
  tags: ["PhonePe"],
  summary: "Cancel PhonePe payment via PhonePe BFF and update outlet_payment_logs",
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
        reference_no: { type: "string" },
        payment_status: { type: "string" }
    },
    ...errorSchemas
  }
}
};

module.exports = cancelPaymentSchema;
