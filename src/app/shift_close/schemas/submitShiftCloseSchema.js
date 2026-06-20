const { errorSchemas } = require("../../commons/schemas/errorSchemas");

const submitShiftCloseSchema = {
  tags: ["Cash Close"],
  summary: "Submit cash close — save denomination and close counter shift",
  headers: { $ref: "request-headers#" },
  body: {
    type: "object",
    additionalProperties: false,
    required: ["outlet_id", "counter_no", "bill_date"],
    properties: {
      outlet_id: { type: "integer" },
      counter_no: { type: "integer" },
      bill_date: { type: "string", format: "date" },
      n2000: { type: "integer", default: 0, minimum: 0 },
      n500: { type: "integer", default: 0, minimum: 0 },
      n200: { type: "integer", default: 0, minimum: 0 },
      n100: { type: "integer", default: 0, minimum: 0 },
      n50: { type: "integer", default: 0, minimum: 0 },
      n20: { type: "integer", default: 0, minimum: 0 },
      n10: { type: "integer", default: 0, minimum: 0 },
      n5: { type: "integer", default: 0, minimum: 0 },
      n2: { type: "integer", default: 0, minimum: 0 },
      n1: { type: "integer", default: 0, minimum: 0 },
      amount_to_be_deposited: { type: "number", default: 0 },
      next_day_balance: { type: "number", default: 0 }
    }
  },
  response: {
    200: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        denom_total: { type: "number" },
        amount_to_be_deposited: { type: "number" },
        next_day_balance: { type: "number" }
      }
    },
    ...errorSchemas
  }
};

module.exports = submitShiftCloseSchema;
