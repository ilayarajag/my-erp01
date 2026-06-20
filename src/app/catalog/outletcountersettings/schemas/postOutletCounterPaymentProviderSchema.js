const { errorSchemas } = require("../../../commons/schemas/errorSchemas");

const postOutletCounterPaymentProviderSchema = {
    tags: ["Outlet Counter Payment Provider"],
    summary: "create payment provider config by id",
    headers: { $ref: "request-headers#" },
    params: {
        type: "object",
        required: ["outlet_id"],
        properties: {
            outlet_id: { type: "integer" }
        }
    },
    body: {
        type: "object",
        properties: {
            counter_no: { type: 'integer' },
            pay_type_id: { type: "integer" },
            provider_name: { type: 'string' },
            config: {
                type: "object",
                required: ["store_id","merchant_id", "terminal_id"],
                properties: {
                    store_id: { type: "string" },
                    merchant_id: { type: "string" },
                    terminal_id: { type: "string" },
                    api_key: { type: 'string' },
                    secret_key: { type: "string" },
                    device_serial_no: { type: "string" }
                }
            }
        }
    },
    response: {
        200: {
            type: "object",
            properties: { success: { type: "boolean" } }
        },
        ...errorSchemas
    }
};

module.exports = postOutletCounterPaymentProviderSchema;
