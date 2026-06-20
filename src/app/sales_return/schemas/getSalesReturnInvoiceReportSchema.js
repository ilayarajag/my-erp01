const { errorSchemas } = require("../../commons/schemas/errorSchemas");

const getSalesReturnInvoiceReportSchema = {
  tags: ["Sales Return Reports"],
  summary: "Sales return invoice list for a specific outlet and date range",
  headers: { $ref: "request-headers#" },
  body: {
    type: "object",
    required: ["from_date", "to_date", "region_id", "outlet_id"],
    properties: {
      region_id: { type: "integer" },
      outlet_id: { type: "integer" },
      from_date: { type: "string", format: "date" },
      to_date: { type: "string", format: "date" }
    }
  },
  response: {
    200: {
      type: "object",
      properties: {
        data: {
          type: "array",
          items: {
            type: "object",
            properties: {
              outlet_name: { type: "string" },
              sr_date: { type: "string" },
              invoice_no: { type: "string" },
              counter_no: { type: "integer" },
              user_name: { type: "string" },
              party_name: { type: "string" },
              amount: { type: "number" }
            }
          }
        }
      }
    },
    ...errorSchemas
  }
};

module.exports = getSalesReturnInvoiceReportSchema;