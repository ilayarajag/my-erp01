const { errorSchemas } = require("../../commons/schemas/errorSchemas");

const getShiftCloseSummarySchema = {
  tags: ["Cash Close"],
  summary: "Get cash close summary — sales stats + existing denomination for outlet/counter/date",
  headers: { $ref: "request-headers#" },
  querystring: {
    type: "object",
    required: ["outlet_id", "counter_no", "bill_date"],
    properties: {
      outlet_id: { type: "integer" },
      counter_no: { type: "integer" },
      bill_date: { type: "string", format: "date" }
    }
  },
  response: {
    200: {
      type: "object",
      properties: {
        summary: {
          type: "object",
          properties: {
            total_sales: { type: "number" },
            total_invoices: { type: "integer" },
            total_card: { type: "number" },
            total_cash: { type: "number" },
            total_upi: { type: "number" },
            total_return: { type: "number" },
            total_return_used: { type: "number" },
            total_loyalty: { type: "number" },
            total_less_amount: { type: "number" },
            total_return_count: { type: "integer" },
            total_discount_amount: { type: "number" },
            avg_sales: { type: "number" }
          }
        },
        denomination: {
          type: ["object", "null"],
          properties: {
            n2000: { type: "integer" },
            n500: { type: "integer" },
            n200: { type: "integer" },
            n100: { type: "integer" },
            n50: { type: "integer" },
            n20: { type: "integer" },
            n10: { type: "integer" },
            n5: { type: "integer" },
            n2: { type: "integer" },
            n1: { type: "integer" }
          }
        }
      }
    },
    ...errorSchemas
  }
};

module.exports = getShiftCloseSummarySchema;
