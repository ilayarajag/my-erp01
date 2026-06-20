const { errorSchemas } = require('../../../commons/schemas/errorSchemas');


const getOutletSettingsMstActiveListSchema = {
    tags: ["Outlet Settings Master"],
    summary: "Get Outlet Settings List with Pagination",
    response: {
        200: {
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
        ...errorSchemas

    }
};

module.exports = getOutletSettingsMstActiveListSchema;
