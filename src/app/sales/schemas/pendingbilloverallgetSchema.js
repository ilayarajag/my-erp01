const { errorSchemas } = require("../../commons/schemas/errorSchemas");

const pendingbilloverallgetSchema = {
  tags: ["Pending Overall Get Bill "],
  summary: "This API is used to Pending Overall Bill",
  headers: { $ref: "request-headers#" },
  body: {
    type: 'object',
    required: ['counter_no','outlet_id'],
    properties: {
        counter_no: { type: 'number' },
        outlet_id: { type: 'number' }
    }
  },
  response: {
    200: {
        type: "array"
      },
      ...errorSchemas
  }
};

module.exports = pendingbilloverallgetSchema;
