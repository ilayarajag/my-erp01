const { errorSchemas } = require("../../../commons/schemas/errorSchemas");

const getOutletMemberInfosSchema = {
  tags: ["OUTLET MEMBERS"],
  summary: "This API is to get outlet member info",
  headers: { $ref: "request-headers#" },
  params: {
    type: "object",
    properties: {
      mobile: { type: "integer" }
    },
    required: ["mobile"]
  },
  // response: {
  //   200: {
  //     type: "object",
  //     properties: {
  //       id: { type: "integer" },
  //       mobile: { type: "string" },
  //       party_name: { type: "string" },
  //       email: { type: "string" },
  //       gst_in: { type: "string" },
  //       balance_points: { type: "number" },
  //       is_active: { type: "boolean" },
  //       created_at: { type: "string", format: "date-time" },
  //       updated_at: { type: "string", format: "date-time" }
  //     }
  //   },
  //   ...errorSchemas
  // }
  response: {
  200: {
    type: "object",
    properties: {
      success: { type: "boolean" },
      status: { type: "string" },

      data: {
        type: "object",
        properties: {
          MemberEntryCount: { type: "integer" },

          user: {
            type: "object",
            properties: {
              MName: { type: "string" },
              MCardNo: { type: "string" },
              Address1: { type: "string" },
              address2: { type: "string" },
              address3: { type: "string" },
              city: { type: "string" },
              pincode: { type: "string" },
              mobile: { type: "string" },
              email: { type: "string" },
              points: { type: "string" },
              Amount: { type: "string" },
              active: { type: "string" },
              clientid: { type: "string" },
              Locid: { type: "string" },
              jdate: { type: "string" },
              LPDate: { type: "string" },
              wallet: { type: "string" },
              Mid: { type: "string" },
              custtype: { type: "string" },
              Jdate: { type: "string" },
              loyalty_otp_threshold: {
                type: "integer"
              },

              nso_offer_redeemed: {
                type: "boolean"
              },

              online_activated: {
                type: "boolean"
              },

              locationdetails: {
                type: "object",
                properties: {
                  LocId: { type: "string" },
                  LocName: { type: "string" }
                }
              }
            }
          }
        }
      }
    }
  },

  ...errorSchemas
}
};

module.exports = getOutletMemberInfosSchema;