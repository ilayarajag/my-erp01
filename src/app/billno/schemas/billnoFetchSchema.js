const { errorSchemas } = require("../../commons/schemas/errorSchemas");

const billnoFetchSchema = {
  tags: ["BILLNO INFO"],
  summary: "This API is to get bill no information",
  headers: { $ref: "request-headers#" },
  body: {
    type: "object",
    required: ["counter_no"],
    properties: {
      counter_no: { type: "integer" }
    }
  },
  response: {
    200: {
      type: "object",
      properties: {
        billno: { type: "number" }
      }

    },
    ...errorSchemas
  }
};

module.exports = billnoFetchSchema;
