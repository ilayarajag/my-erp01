const { errorSchemas } = require('../../../commons/schemas/errorSchemas');

const getCountersMstSchema = {
  tags: ['COUNTERS_MASTER'],
  summary: 'This API is to get counters master',
  headers: { $ref: 'request-headers#' },
  response: {
    200: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          counter_name: { type: 'string' },
          counter_no: { type: 'integer' },
          is_active: { type: 'boolean' }
        }
      }
    },
    ...errorSchemas
  }
};

module.exports = getCountersMstSchema;
