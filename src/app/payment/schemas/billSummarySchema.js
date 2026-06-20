const { errorSchemas } = require("../../commons/schemas/errorSchemas");
const billSummarySchema = {
  tags: ["Save Bill Schema"],
  summary: "This API is used to save the bills. ",
  headers: { $ref: "request-headers#" },
  body: {
    type: "object",
    required: ["counter_no", "outlet_id"],
    properties: {
      outlet_id: { type: "integer" },
      customer_id: { type: "integer" },
      bags: { type: "integer" },
      counter_no: { type: "integer" },
      pay_type_id : { type: "integer" },
      mode: {
        type: "array",

        items: {
          type: "object",

          properties: {
            id: { type: "integer" },

            amount: { type: "number" }
          },
          required: ["id", "amount"]
        }
      }

    }
  },
  response: {
    200: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        billno: { type: "string" },
         reference_no: { type: "string" }
      }
    },
    ...errorSchemas
  }
};

module.exports = billSummarySchema;
