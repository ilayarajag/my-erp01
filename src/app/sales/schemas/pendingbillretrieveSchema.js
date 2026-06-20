const { errorSchemas } = require("../../commons/schemas/errorSchemas");
const pendingbillretrieveSchema = {
  tags: ["Pending Retireve Bill Check"],
  summary: "This API is used to Pending Retireve Bill",
  headers: { $ref: "request-headers#" },
  body: {
    type: 'object',
    required: ['counter_no', 'bill_no','outlet_id'],
    properties: {
        counter_no: { type: 'number' },
        bill_no: { type: 'string' },
        outlet_id: { type: 'number' }
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

module.exports = pendingbillretrieveSchema;
