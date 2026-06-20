const { errorSchemas } = require("../../commons/schemas/errorSchemas");

const getGeneralReturnReportSchema = {
  tags: ["Sales Return Reports"],
  summary: "Daily sales return summary per outlet grouped by date",
  headers: { $ref: "request-headers#" },
  body: {
    type: "object",
    required: ["from_date", "to_date", "region_id"],
    properties: {
      region_id: { type: "integer" },
      outlet_id: { type: ["integer", "null"] },
      from_date: { type: "string", format: "date" },
      to_date: { type: "string", format: "date" }
    }
  },
  response: {
    200: {
      type: "object",
      properties: {
        bills_count: { type: "integer" },
        total_amount: { type: "number" },
        data: {
          type: "array",
          items: {
            type: "object",
            properties: {
              region: { type: "string" },
              outlet_id: { type: "integer" },
              outlet_name: { type: "string" },
              store_code: { type: "string" },
              date: { type: "string" },
              bills: { type: "integer" },
              amount: { type: "number" },
              start_date: { type: "string" },
              end_date: { type: "string" }
            }
          }
        }
      }
    },
    ...errorSchemas
  }
};

module.exports = getGeneralReturnReportSchema;
