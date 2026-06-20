const { errorSchemas } = require('../../../commons/schemas/errorSchemas');

const getInauguralOfferInfoSchema = {
    tags: ["Inaugural Offer"],
    summary: "Get Inaugural Offer by ID",
    params: {
        type: "object",
        required: ["outlet_id"],
        properties: {
            outlet_id: { type: "integer" }
        }
    },
    response: {
        200: {
            type: "object",
            properties: {
                id: { type: "integer" },
                outlet_id: { type: "integer" },
                outlet_name: { type: "string" },
                store_code: { type: "string" },
                io_date: { type: "string" },
                io_days: { type: "integer" },
                io_purchase_amt: { type: "number" },
                io_discount_amt: { type: "number" },
                io_bonus_pnt: { type: "number" },
                status: { type: "boolean" },
                is_active: { type: "boolean" },
                created_at: { type: "string" },
                updated_at: { type: "string" }
            }
        },
        ...errorSchemas
    }
};


module.exports = getInauguralOfferInfoSchema;