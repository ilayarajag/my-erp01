const { errorSchemas } = require('../../../commons/schemas/errorSchemas');

const postClearanceCategoryListPageSchema = {
  tags: ['CLEARANCE_SALES_SETTINGS'],
  summary: 'This API is to get clearance category list with pagination',
  headers: { $ref: 'request-headers#' },
  params: {
    type: 'object',
    required: ['page_size', 'current_page'],
    properties: {
      page_size: { type: 'integer', minimum: 1 },
      current_page: { type: 'integer', minimum: 1 }
    }
  },
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
        },
        meta: { $ref: 'response-meta#' }
      }
    },
    ...errorSchemas
  }
};

module.exports = postClearanceCategoryListPageSchema;
