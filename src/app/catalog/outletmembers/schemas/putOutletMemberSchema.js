const { errorSchemas } = require("../../../commons/schemas/errorSchemas");

const putOutletMemberSchema = {
  tags: ["OUTLET MEMBERS"],
  summary: "This API is to update Outlet Member",
  headers: { $ref: "request-headers#" },

  params: {
    type: "object",
    required: ["member_id"],
    properties: {
      member_id: { type: "integer" }
    }
  },

  body: {
    type: "object",
    required: ["mobile"], // ✅ minimum required
    additionalProperties: false,
    properties: {
      mobile: { type: "string", minLength: 10, maxLength: 15 },
      party_name: { type: "string" },
      email: { type: "string" },
      gst_in: { type: "string" },
      balance_points: { type: "number" },
      is_active: { type: "boolean" },
      amount: { type: "number" }
    }
  },
  response: {
    200: {
      type: "object",
      properties: {
        success: { type: "boolean" }
      }
    },
    ...errorSchemas
  }
};

module.exports = putOutletMemberSchema;