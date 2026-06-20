const { errorSchemas } = require("../../../commons/schemas/errorSchemas");

const deletePayTypeSchema = {
  tags: ["PAY TYPE"],
  summary: "This API is to delete Pay Type (Soft Delete)",
  headers: { $ref: "request-headers#" },

  params: {
    type: "object",
    required: ["pay_type_id"],
    properties: {
      pay_type_id: { type: "integer" }
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

module.exports = deletePayTypeSchema;