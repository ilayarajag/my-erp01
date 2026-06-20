const { errorSchemas } = require("../../commons/schemas/errorSchemas");

const offerCheckSchema = {
  tags: ["Offer Check"],
  summary: "This API is used to Offer Check",
  headers: { $ref: "request-headers#" },
  body: {
    type: "array",
    minItems: 1,
    // maxItems: 300,
    items: {
      type: "object",
      required: ["prod_id", "prod_code"],
      properties: {
        prod_id: { type: "integer" },
        prod_code: { type: "string" },
        qty: { type: "number" },
        mrp: { type: "number" }
      }
    }
  },
  response: {
    200: {
      type: "object",
      properties: {
        offamt: { type: "number" }
      }
    },
    ...errorSchemas
  }
};

module.exports = offerCheckSchema;
