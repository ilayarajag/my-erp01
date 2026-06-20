const { errorSchemas } = require("../../commons/schemas/errorSchemas");
const billStatusSchema = {
  tags: ["Save Bill Schema"],
  summary: "This API is used to save the bills. ",
  headers: { $ref: "request-headers#" },
  body: {
    type: "object",
    required: ["counter_no", "outlet_id"],
    properties: {
      outlet_id: { type: "integer" },
      counter_no: { type: "integer" },
      reference_id: { type: "integer" },
      provider_id : { type: "integer" },

    }
  },
  response: {
    200: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        //billno: { type: "string" },
         reference_no: { type: "string" },
         paymentStatus : { type: "string" },
      }
    },
    ...errorSchemas
  }
};

module.exports = billStatusSchema;
