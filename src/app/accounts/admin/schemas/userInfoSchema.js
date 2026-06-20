const { errorSchemas } = require("../../../commons/schemas/errorSchemas");

const userInfoSchema = {
    tags: ["USER'S INFO"],
    summary: "This API is to get users information",
    headers: { $ref: "request-headers#" },
    response: {
        200: {
            type: "object",
            properties: {
                id: { type: "integer" },
                user_name: { type: "string" },
                user_email: { type: "string" },
                user_mobile: { type: "string" },
                company_id: { type: "integer" },
                current_company_id: { type: "integer" },
                user_type: { type: "integer", enum: [0, 1, 2] },
                role_name: { type: "string" },
                role_id: { type: "integer" },
                outlet_id: { type: "integer" },
                outlet_name: { type: "string" },
                counter_no: { type: "integer" },
                company_name: { type: "string" },
                company_code: { type: "string" },
                timezone: { type: "string" },
                currency: { type: "string" }
            },
            required: ["id", "user_name", "user_email", "user_mobile", "user_password", "company_id", "user_type", "is_active", "created_at", "updated_at", "password_updated_at", "outlet_id", "counter_no"]
        },
        ...errorSchemas
    }
};

module.exports = userInfoSchema;
