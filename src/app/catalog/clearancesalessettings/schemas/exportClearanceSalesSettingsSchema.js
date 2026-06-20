const { errorSchemas } = require('../../../commons/schemas/errorSchemas');

const exportClearanceSalesSettingsSchema = {
  tags: ['CLEARANCE_SALES_SETTINGS'],
  summary: 'This API is to get clearance sales settings',
  headers: { $ref: 'request-headers#' },
  response: {
    200: {
      description: "Excel file download",
      type: "string",
      format: "binary"
    },
    ...errorSchemas
  }
};

module.exports = exportClearanceSalesSettingsSchema;
