const { errorSchemas } = require('../../../commons/schemas/errorSchemas');

const postOutletSettingSchema = {
  tags: ['OUTLET_SETTINGS'],
  summary: 'This API is to create outlet setting',
  headers: { $ref: 'request-headers#' },
  body: {
    type: 'object',
    required: ['outlet_id'],
    properties: {
      outlet_id: {
        type: "array",
        items: {
          type: 'integer'
        }
      },
      outlet_settings_master_id: { type: "integer" },
      web_name: { type: 'string', maxLength: 50 },
      s_value: { type: 'string' }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' }
      }
    },
    ...errorSchemas
  }
};

module.exports = postOutletSettingSchema;
