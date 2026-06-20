const { errorSchemas } = require("../../../commons/schemas/errorSchemas");

const dqrInitSchema = {
    tags: ["PhonePe DQR"],
    summary: "Initiate DQR transaction via PhonePe and record",
    headers: { $ref: "request-headers#" },
    body: {
        type: "object",
        additionalProperties: false,
        required: [
            "counter_no",
            "outlet_id",
            "provider_id",
            "is_card",
            "is_split_payment"
        ],
        properties: {
            outlet_id: { type: "integer" },
            customer_id: { type: "integer" },
            counter_no: { type: "integer" },
            provider_id: { type: "integer" },
            is_card: {
                type: "string",
                enum: ["yes", "no"]
            },
            is_split_payment: { type: "boolean" },
            mode: {
                type: "array",
                items: {
                    type: "object",
                    additionalProperties: false,
                    required: ["id", "amount"],
                    properties: {
                        id: { type: "integer" },
                        amount: { type: "number", minimum: 0 }
                    }
                }
            }
        }
    },

    response: {
        200: {
            type: "object",
            properties: {
                success: { type: "boolean" },
                billno: { type: "string" },
                reference_no: { type: "string" }
            }
        },
        ...errorSchemas
    }
};

module.exports = dqrInitSchema;