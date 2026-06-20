const { errorSchemas } = require("../../commons/schemas/errorSchemas");

const getGeneralReturnProductSchema = {
  tags: ["Sales Return"],
  summary: "Fetch product rate and tax details for general sales return",
  headers: { $ref: "request-headers#" },
  body: {
    type: "object",
    additionalProperties: false,
    required: ["outlet_id", "product_code"],
    properties: {
      outlet_id: { type: "integer" },
      product_code: { type: "string" }
    }
  },
  response: {
    200: {
      type: "object",
      properties: {
        product_id: { type: "integer" },
        product_code: { type: "string" },
        product_name: { type: "string" },
        uom_name: { type: "string" },
        batch_no: { type: ["string", "null"] },
        balance_qty: { type: "number" },
        mrp: { type: "number" },
        sale_rate: { type: "number" },
        discount_amount: { type: "number" },
        gst_per: { type: "number" },
        gst_amount: { type: "number" },
        cess_per: { type: "number" },
        cess_amount: { type: "number" },
        return_rate: { type: "number" },
        rate_source: {
          type: "string",
          enum: [
            "LAST_SELLING_RATE",
            "DEFAULT_RETURN_RATE"
          ]
        }
      }
    },
    ...errorSchemas
  }
};

module.exports = getGeneralReturnProductSchema;
