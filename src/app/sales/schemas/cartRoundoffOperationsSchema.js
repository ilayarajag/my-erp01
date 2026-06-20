const { errorSchemas } = require("../../commons/schemas/errorSchemas");

const cartRoundoffOperationsSchema = {
  tags: ["CART"],
  summary:
    "This API is used to do cart operations.",
  headers: { $ref: "request-headers#" },
  body: {
    type: "object",
    required: [

      // "cart_quantity",
      // "round_off",
      "counter_no",
      "outlet_id",
      "mode"
    ],
    additionalProperties: false,
    properties: {
      mode: { type: "number" },
      counter_no: { type: "integer" },
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

module.exports = cartRoundoffOperationsSchema;
