const { type } = require("os");
const { errorSchemas } = require("../../commons/schemas/errorSchemas");

const billPdfSchema = {
  tags: ["CART"],
  summary: "This API is used to get cart print summary.",
  headers: { $ref: "request-headers#" },

  params: {
    type: "object",
    required: ["counter_no", "outlet_id"],
    properties: {
      counter_no: { type: "integer" },
      outlet_id: { type: "integer" },
      bill_no: { type: "integer" },
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

module.exports = billPdfSchema;