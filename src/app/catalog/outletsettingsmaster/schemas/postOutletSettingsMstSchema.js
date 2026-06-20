const { errorSchemas } = require('../../../commons/schemas/errorSchemas');

const postOutletSettingsMstSchema = {
  tags: ["Outlet Settings Master"],
  summary: "Create Outlet Settings",
  body: {
    type: "object",
    required: ["web_name", "s_group", "web_active", "daily_update"],
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
      data_type: { type: "integer", enum: [0, 1, 2, 3] }, // 0-> boolean, 1- date , 2 - number , 3- string
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
        success: { type: "boolean" },
        insert_id: { type: "integer" }
      }
    },
    ...errorSchemas
  }
};

module.exports = postOutletSettingsMstSchema;
