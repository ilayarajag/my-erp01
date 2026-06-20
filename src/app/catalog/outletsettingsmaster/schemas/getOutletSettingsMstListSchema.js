const { errorSchemas } = require('../../../commons/schemas/errorSchemas');

const getOutletSettingsMstListSchema = {
    tags: ["Outlet Settings Master"],
    summary: "Get Outlet Settings List with Pagination",
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
            search: { type: "string" }
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
                            web_name: { type: "string" },
                            s_group: { type: "string" },
                            table_name: { type: ["string", "null"] },
                            column_name: { type: ["string", "null"] },
                            web_active: { type: "boolean" },
                            daily_update: { type: "boolean" },
                            data_type: { type: ["integer", "null"] },
                            description: { type: ["string", "null"] }
                        }
                    }
                },
                meta: { $ref: "response-meta#" }
            }
        },
        ...errorSchemas
    }
};

module.exports = getOutletSettingsMstListSchema;
