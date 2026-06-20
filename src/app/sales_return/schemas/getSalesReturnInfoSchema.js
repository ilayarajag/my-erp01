const { errorSchemas } = require("../../commons/schemas/errorSchemas");

const getSalesReturnInfoSchema = {
  tags: ["Sales Return"],
  summary: "Get sales return details by sales return number",
  headers: { $ref: "request-headers#" },
  params: {
    type: "object",
    required: ["sr_no"],
    properties: {
      sr_no: { type: "string" }
    }
  },
  // response: {
  //   200: {
  //     type: "object",
  //     properties: {
  //       master: { type: "object" },
  //       details: { type: "array", items: { type: "object" } },
  //       coupon: { type: "object" }
  //     }
  //   },
  //   ...errorSchemas
  // }
};

module.exports = getSalesReturnInfoSchema;
