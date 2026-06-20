const { errorSchemas } = require("../../../commons/schemas/errorSchemas");

const putInauguralOfferSchema = {
    tags: ["Inaugural Offer"],
    summary: "Update Inaugural Offer",
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
            io_date: { type: "string", format: "date-time" },
            io_days: { type: "integer", minimum: 1 },
            io_purchase_amt: { type: "number", minimum: 0 },
            io_discount_amt: { type: "number", minimum: 0 },
            io_bonus_pnt: { type: "number", minimum: 0 },
            is_active: { type: "boolean" }
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


module.exports = putInauguralOfferSchema;