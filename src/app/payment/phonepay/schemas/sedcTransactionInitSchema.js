const { toInteger } = require("lodash");
const { errorSchemas } = require("../../../commons/schemas/errorSchemas");

const sedcTransactionInitSchema = {
  tags: ["PhonePe EDC"],
  summary: "Initiate SEDC transaction via PhonePe BFF and record in outlet_bill_payments",
  headers: { $ref: "request-headers#" },
  body: {
    type: "object",
    additionalProperties: false,
    required: [
      "counter_no",
      "outlet_id",
      "provider_id",
      "is_card",
      "is_split_payment"
    ],
    properties: {
      outlet_id: { type: "integer" },
      customer_id: { type: "integer" },
      counter_no: { type: "integer" },
      provider_id: { type: "integer" },
      is_card: { type: "string", enum: ["yes", "no"] },
      is_split_payment: { type: "boolean" },
      mode: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["id", "amount"],
          properties: {
            id: { type: "integer" },
            amount: { type: "number", minimum: 0 }
          }
        }
      }
    }
  },
  response: {
    200: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        reference_no: {
          anyOf: [
            { type: "string" },
            { type: "integer" },
            { type: "null" }
          ]
        },
        amount: {
          anyOf: [
            { type: "number" },
            { type: "string" },
            { type: "null" }
          ]
        },
        billno: { type: "integer" },
        qrString: { type: "string" }
      }
    },
    ...errorSchemas
  }
};

module.exports = sedcTransactionInitSchema;
