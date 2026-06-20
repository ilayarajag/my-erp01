const { errorSchemas } = require("../../../commons/schemas/errorSchemas");

const getOutletMembersListSchema = {
  tags: ["OUTLET MEMBERS"],
  summary: "This API is to get Outlet Members (Paginated)",
  headers: { $ref: "request-headers#" },

  queryString: {
    type: "object",
    required: ["status", "search"],
    additionalProperties: false,
    properties: {
      //status: { type: "integer", enum: [0, 1, 2], default: 0 }, // 0 all, 1 active, 2 inactive
      search: { type: "string", default: "" }
    }
  },

  params: {
    type: "object",
    properties: {
      page_size: { type: "integer" },
      current_page: { type: "integer" }
    }
  },

  response: {
    200: {
      type: "object",
      properties: {
        data: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "integer" },
              mobile: { type: "string" },
              party_name: { type: "string" },
              email: { type: "string" },
              gst_in: { type: "string" },
              balance_points: { type: "string" }, 
              wallet_amount: { type: "string" },
              is_active: { type: "boolean" },
              created_at: { type: "string" },
              updated_at: { type: "string" },
              created_by: { type: ["integer", "null"] },
              updated_by: { type: ["integer", "null"] },
              customer_type: { type: "string" } ,// B2B / B2C,
              reedem_amount: { type: "number" },
              reedem_points:{ type: "number" },
            }
          }
        },

        meta: { $ref: "response-meta#" }
      }
    },

    ...errorSchemas
  }
};

module.exports = getOutletMembersListSchema;