const { errorSchemas } = require("../../commons/schemas/errorSchemas");
const { CustomError } = require("../../errorHandler");
const dataStoreError = require("../../errorHandler/mappers/dataStoreError");

const getloyalitySchema = {
    tags: ["CART LOYALTY"],

    summary: "Apply or remove loyalty points in cart",

    headers: { $ref: "request-headers#" },

    params: {
        type: "object",
        required: ["outlet_id"],
        properties: {
            outlet_id: {
                type: "integer"
            },
            points : {
                type: "number"
            },
            customer_id : {
                type: "integer"
            }
           
        }
    },

    body: {
        type: "object",
        required: ["is_apply_loyalty"],
        properties: {
            is_apply_loyalty: {
                type: "boolean",
                description: "Apply or remove loyalty redeem"
            },
             counter_id : {
                type: "integer"
            }
        }
    },

    response: {
  200: {
    type: "object",
    properties: {
      success: { type: "boolean" },

      data: {
        type: "object",
        properties: {
          earned_points: { type: "number" },
          redeem_points: { type: "number" },
          final_points: { type: "number" },
          bill_amount: { type: "number" }
        }
      }
    }
  },

        ...errorSchemas
    }
};

module.exports = getloyalitySchema;