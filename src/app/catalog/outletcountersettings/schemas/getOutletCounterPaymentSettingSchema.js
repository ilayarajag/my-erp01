const { errorSchemas } = require("../../../commons/schemas/errorSchemas");

const getOutletCounterPaymentModesSchema = {
  tags: ["OUTLET COUNTER PAYMENT MODES"],

  summary: "This API is used to get outlet counter payment modes.",

  headers: {
    $ref: "request-headers"
  },

  params: {
    type: "object",

    required: [ "outlet_id"],

    properties: {
      counter_no: { type: "integer" },
      outlet_id: { type: "integer" }
    }
  },

  response: {
    200: {
      type: "object",

      properties: {
        data: {
          type: "array",

          items: {
            type: "object",

            properties: {
              id: { type: "integer" },

              outlet_id: { type: "integer" },

              counter_no: { type: "integer" },

             // payment_id: { type: "integer" },

              //pay_type_id: { type: "integer" },

              provider_name: { type: "string" },

             // outlet_name: { type: "string" }
            }
          }
        }
      }
    },

    ...errorSchemas
  }
};

module.exports = getOutletCounterPaymentModesSchema;