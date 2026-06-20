const { errorSchemas } = require('../../../commons/schemas/errorSchemas');


const getInauguralOfferListSchema = {
    tags: ["Inaugural Offer"],
    summary: "Get Inaugural Offer List with Pagination",
    params: {
        type: "object",
        required: ["page_size", "current_page"],
        properties: {
            page_size: { type: "integer", minimum: 1 },
            current_page: { type: "integer", minimum: 1 }
        }
    },
    querystring: {
        type: "object",
        properties: {
            search: { type: "string" },
            active: { type: "integer" }
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
                    }
                },
                meta: { $ref: "response-meta#" }
            }
        },
        ...errorSchemas
    }
};

module.exports = getInauguralOfferListSchema;