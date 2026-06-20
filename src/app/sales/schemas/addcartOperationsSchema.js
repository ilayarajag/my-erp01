const { errorSchemas } = require("../../commons/schemas/errorSchemas");
const { CustomError } = require("../../errorHandler");

const addcartOperationsSchema = {
  tags: ["CART"],
  summary:
    "This API is used to do cart operations. 'add' for adding, 'substract' for updating and 'zero' for removing",
  headers: { $ref: "request-headers#" },
  body: {
    type: "object",
    required: [

     // "cart_quantity",
      "code",
      "counter_no",
      "outlet_id"
    ],
    additionalProperties: false,
    properties: {
     // cart_quantity: { type: "number" },
      //code: { type: "string", pattern: "^[a-zA-Z0-9.]{1,13}$" },
        code: { type: "string" },
      counter_no: { type: "integer" },
      outlet_id: { type: "integer" },
      cart_quantity : { type: "number" },
      customer_id: { type: "string" },
      mrp : { type: "number" },


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

module.exports = addcartOperationsSchema;
