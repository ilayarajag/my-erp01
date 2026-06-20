const { errorSchemas } = require('../../../commons/schemas/errorSchemas');
const { params } = require('../../device/schemas/deleteDeviceSchema');

const getOutletSettingsSchema = {
  tags: ['OUTLET_SETTINGS'],
  summary: 'This API is to search outlet settings',
  headers: { $ref: 'request-headers#' },
  params: {
    type: 'object',
    properties: {
      outlet_settings_master_id: { type: 'integer' }
    },
    required: ['outlet_settings_master_id']
  },
  querystring: {
    type: 'object',
    properties: {
      search: { type: 'string' }
    }
  },
  response: {
    200: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          outlet_id: { type: 'integer' },
          outlet_name: { type: 'string' },
          region: { type: 'string' },
          store_code: { type: 'string' },
          web_name: { type: 'string' },
          status: { type: 'string' }
        }
      }
    },
    ...errorSchemas
  }
};

module.exports = getOutletSettingsSchema;
