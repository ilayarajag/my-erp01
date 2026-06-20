const { errorSchemas } = require("../../commons/schemas/errorSchemas");

const cartBatchOperationsSchema = {
  tags: ["CART"],
  summary:
    "This API is used to do cart operations.",
  headers: { $ref: "request-headers#" },
  body: {
    type: "object",
    required: [

     // "cart_quantity",
      "prod_id",
      "counter_no",
      "outlet_id"
    ],
    additionalProperties: false,
    properties: {
      prod_id: { type: "number" },
      counter_no: { type: "integer" },
      outlet_id: { type: "integer" }


    }
  },
 response: {
  200: {
    type: "array",
    items: {
      type: "object",
      properties: {
        batch_no: { type: "string" },
        product_id: { type: "number" },
        mrp: { type: "number" }
      }
    }
  },
  ...errorSchemas
}
};

module.exports = cartBatchOperationsSchema;
