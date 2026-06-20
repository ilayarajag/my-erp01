const { errorSchemas } = require("../../commons/schemas/errorSchemas");
const specificCartSchema = {
  tags: ["CART"],
  summary: "This API is used to clear the Cart",
  headers: { $ref: "request-headers#" },
  params: {
    type: "object",
    properties: {
      counter_no: { type: "integer" },
      //bill_no: { type: "string" },
      code: { type: "string" },
      outlet_id: { type: "integer" }
    }
  },
  response: {
    200: {
      type: "object",
      properties: {
        success: { type: "string" }
      }
    },
    ...errorSchemas
  }
};

module.exports = specificCartSchema;
