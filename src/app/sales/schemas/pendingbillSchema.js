const { errorSchemas } = require("../../commons/schemas/errorSchemas");
const pendingBillSchema = {
  tags: ["Pending Bill Check"],
  summary: "This API is used to Pending Bill",
  headers: { $ref: "request-headers#" },
  body: {
    type: 'object',
    required: ['counter_no', 'bill_no', 'outlet_id','customer_id'],
    properties: {
        counter_no: { type: 'number' },
        outlet_id: { type: 'number' },
        bill_no: { type: 'string' },
        customer_id: { type: 'number' }
    }
  },
  response: {
    200: {
        type: "object",
        properties: {
          success: { type: "boolean" }
        }
      },
      ...errorSchemas
  }
};

module.exports = pendingBillSchema;
