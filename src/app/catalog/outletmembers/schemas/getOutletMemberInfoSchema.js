const { errorSchemas } = require("../../../commons/schemas/errorSchemas");


const getOutletMemberInfoSchema = {
  tags: ["OUTLET MEMBERS"],
  summary: "This API is to get outlet member info",
  headers: { $ref: "request-headers#" },
  params: {
    type: "object",
    properties: {
      member_id: { type: "integer" }
    },
    required: ["member_id"]
  },
   response: {
  200: {
    type: "array",
    items: {
      type: "object",
      properties: {
        id: { type: "integer" },
        mobile: { type: "string" },
        party_name: { type: "string" },
        email: { type: "string" },
        gst_in: {
          anyOf: [
            { type: "string" },
            { type: "null" }
          ]
        },
        balance_points: { type: "string" },
        wallet_amount: { type: "string" },
        city: { type: "string" },
        pincode: { type: "string" },
        address: { type: "string" },
        card_no: { type: "string" },
        outlet_id: { type: "integer" },
        created_by: { type: "integer" },
        updated_by: { type: "integer" },
        is_active: { type: "boolean" },
        created_at: {
          type: "string",
          format: "date-time"
        },
        updated_at: {
          type: "string",
          format: "date-time"
        }
      }
    }
  },

  ...errorSchemas
}
};
module.exports = getOutletMemberInfoSchema;