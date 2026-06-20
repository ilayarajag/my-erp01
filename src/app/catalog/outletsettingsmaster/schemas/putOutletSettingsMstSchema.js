const { errorSchemas } = require('../../../commons/schemas/errorSchemas');

const putOutletSettingsMstSchema = {
  tags: ["Outlet Settings Master"],
  summary: "Update Outlet Settings",
  params: {
    type: "object",
    required: ["s_id"],
    properties: {
      s_id: { type: "integer" }
    }
  },
  body: {
    type: "object",
    properties: {
      web_name: {
        type: "string",
        maxLength: 50,
        minLength: 1
      },
      s_group: {
        type: "string",
        maxLength: 50,
        minLength: 1
      },
      table_name: {
        type: "string",
        maxLength: 30
      },
      column_name: {
        type: "string",
        maxLength: 30
      },
      web_active: { type: "boolean" },
      daily_update: { type: "boolean" },
      data_type: { type: "integer" },
      description: {
        type: "string",
        maxLength: 300
      }
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

module.exports = putOutletSettingsMstSchema;
