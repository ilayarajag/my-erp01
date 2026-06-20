
const { errorSchemas } = require('../../../commons/schemas/errorSchemas');

const postClearanceCategoryListSchema = {
  tags: ['CLEARANCE_SALES_SETTINGS'],
  summary: 'This API is to get clearance category list',
  headers: { $ref: 'request-headers#' },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              subcategory: { type: 'string' },
              percentage: { type: 'number' },
              status: { type: 'string' }
            }
          }
        }
      }
    },
    ...errorSchemas
  }
};

module.exports = postClearanceCategoryListSchema;
