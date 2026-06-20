const { PRECONDITION_FAILED } = require("http-status-codes");
const { errorSchemas } = require("../../commons/schemas/errorSchemas");
const { CustomError } = require("../../errorHandler");
const { billSaveHandler } = require("../handlers");
const cartlistSchema = {
  tags: ["CART"],
  summary: "This API is used to get cart details.",
  headers: { $ref: "request-headers#" },
  params: {
    type: "object",
    required: ["counter_no", "outlet_id"],
    properties: {
      counter_no:  { type: "integer" },
      outlet_id:   { type: "integer" },
      customer_id: { type: "integer" },
    },
  },
  response: {
    200: {
      type: "object",
      required: ["cart_lines", "cart_qty", "cart_total"],
      properties: {

        cart_lines: {
          type: "array",
          items: {
            type: "object",
            required: ["code", "quantity", "sales_rate", "total"],
      properties: {
  code: { type: "string" },

  quantity: { type: "string" },

  discount_amount: {
    type: "number",
    default: 0
  },

  sales_rate: {
    type: "number",
    default: 0
  },

  prod_name: { type: "string" },

  uom_name: { type: "string" },

  total: {
    type: "number",
    default: 0
  },

 mrp: {
  oneOf: [
    { type: "number" },
    { type: "array" }
  ]
},

  batch_details: {
    oneOf: [
      {
        type: "array",
        default: [],
        items: {
          type: "object",
          properties: {
            mrp: {
              type: "number",
              default: 0
            },

            batch_no: {
              type: "string",
              default: ""
            },

            prod_id: {
              type: "integer",
              default: 0
            }
          }
        }
      }
    ]
  }
}
          },
        },

        customer_det: {
          type: "object",
          properties: {
            customer_name: { type: "string" },
            address:       { type: "string" },
            mobile:        { type: "string" },
            points:        { type: "number" },
            amount:        { type: "number" },
          },
        },

        cart_qty:       { type: "string" },
        cart_sub_total: { type: "string" },
        cart_total:     { type: "string" },
        cart_gst:       { type: "string" },
        cart_cess:      { type: "string" },
        cart_discount:  { type: "string" },
      },
    },
    ...errorSchemas,
  },
};

module.exports = cartlistSchema;