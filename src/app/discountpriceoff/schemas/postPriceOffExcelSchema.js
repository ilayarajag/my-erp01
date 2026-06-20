const { errorSchemas } = require("../../commons/schemas/errorSchemas");

const postPriceOffExcelSchema = {
    tags: ["PriceOff"],
    summary: "API to post multiple Price Off entries",
    headers: { $ref: "request-headers#" },
    body: {
        type: "array",
        minItems: 1,
        items: {
            type: "object",
            required: [
                "prod_code",
                "amount",
                "etype",
                "pfrom",
                "pto",
                "outlet",
                "pname",
                "pcompamt",
                "plocamt",
                "pactive",
                // "status",
                "uid",
                "pmrp"
            ],
            properties: {
                prod_code: { type: "string", description: "Product code" },
                amount: { type: "number", format: "float", description: "Amount for price offer" },
                etype: { type: "integer", description: "Event type or offer type" },
                pfrom: { type: "string", format: "date-time", description: "Price offer start date" },
                pto: { type: "string", format: "date-time", description: "Price offer end date" },
                pname: { type: "string", maxLength: 500, description: "Product name" },
                pcompamt: { type: "number", format: "float", description: "Price component amount" },
                plocamt: { type: "number", format: "float", description: "Price local amount" },
                pactive: { type: "integer", enum: [0, 1], description: "Active status (0 or 1)" },
                downdt: { type: ["string", "null"], format: "date-time", description: "Download date" },
                // status: { type: "integer", enum: [0, 1], description: "Status of the price offer" },
                uid: { type: "integer", description: "User ID who created or updated the price offer" },
                pmrp: { type: "number", format: "float", minimum: 0, description: "Product MRP" },
                company_id: { type: "integer", default: 1, description: "Company ID" },
                outlet: {
                    type: "array",
                    items: { type: "integer" },
                    minItems: 1,
                    description: "Array of outlet IDs, must contain at least one ID",
                },
                ppartner: {
                    type: "array",
                    items: { type: "integer" },
                    // minItems: 1,
                    description: "Array of partner IDs, must contain at least one ID",
                },
            }
        }
    },
    response: {
        200: {
            type: "object",
            properties: {
                success: { type: "boolean" },
                insertedCount: { type: "integer" },
                failedCount: { type: "integer" },
                failedInserts: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            index: { type: "integer", description: "Index of failed record in request array" },
                            reason: { type: "string", description: "Error or validation failure reason" },
                            payload: { type: "object", description: "Original payload that failed" }
                        }
                    }
                }
            }
        },
        ...errorSchemas
    }
};

module.exports = postPriceOffExcelSchema;
