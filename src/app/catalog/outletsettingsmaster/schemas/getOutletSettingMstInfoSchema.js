const { errorSchemas } = require('../../../commons/schemas/errorSchemas');


const getOutletSettingInfoSchema = {
  tags: ["Outlet Settings Master"],
  summary: "Get Outlet Settings Info",
  params: {
    type: "object",
    required: ["s_id"],
    properties: {
      s_id: { type: "integer" }
    }
  },
  response: {
    200: {
      type: "object",
      properties: {
        id: { type: "integer" },
        web_name: { type: "string" },
        s_group: { type: "string" },
        table_name: { type: "string" },
        column_name: { type: "string" },
        web_active: { type: "boolean" },
        daily_update: { type: "boolean" },
        data_type: { type: "integer" },
        description: { type: ["string", "null"] }
      }
    },
    ...errorSchemas
  }
};

module.exports = getOutletSettingInfoSchema;
