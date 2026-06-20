const { errorSchemas } = require("../../../commons/schemas/errorSchemas");
const { CARD_TRANSACTION } = require("../../../sales/commons/constants");

const postOutletMemberSchema = {
  tags: ["OUTLET MEMBERS"],
  summary: "This API is to create Outlet Member",
  headers: { $ref: "request-headers#" },
  body: {
    type: "object",
    additionalProperties: false,
    anyOf: [
      {
        required: ["mobile"],
        properties: {
          mobile: { type: "integer" }
        }
      },
      {
        required: ["gst_in"],
        properties: {
          gst_in: { type: "string" }
        }
      }
    ],
    required: ['party_name'],
    properties: {
      mobile: { type: "string", minLength: 10, maxLength: 15 },
      party_name: { type: "string" },
      email: { type: "string" },
      gst_in: { type: "string" },
      balance_points: { type: "number", default: 0 },
      card_no: { type: "number" },
      address: { type: "string" },
      city: { type: "string" },
      pincode: { type: "number" },
      points: { type: "number" },
      amount: { type: "number" },
    }

  },
  response: {
    200: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        insert_id: { type: "integer" }
      }
    },

    ...errorSchemas
  }
};

module.exports = postOutletMemberSchema;