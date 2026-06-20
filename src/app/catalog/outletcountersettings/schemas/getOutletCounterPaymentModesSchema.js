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
     // counter_no: { type: "integer" },
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
              pay_type_id: { type: "integer" },

              outlet_id: { type: "integer" },

              counter_no: { type: "integer" },

              is_active: { type: "boolean" },

              outlet_name: { type: "string" },

              pay_type: { type: "string" },

              store_code: { type: "string" }
            }
          }
        }
      }
    },

    ...errorSchemas
  }
};

module.exports = getOutletCounterPaymentModesSchema;