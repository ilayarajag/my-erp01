const { type } = require('os');
const { errorSchemas } = require('../../../commons/schemas/errorSchemas');
const { request } = require('http');

const postClearanceSalesSettingsSchema = {
    tags: ['CLEARANCE_SALES_SETTINGS'],
    summary: 'This API is to create clearance sales setting',
    headers: { $ref: 'request-headers#' },
    request: {
        type: 'object',
        properties: {
            data: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        subcategory: { type: "string" },
                        percentage: { type: "number" },
                        status: { type: "string" }
                    }
                }
            }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                total: { type: "integer" },
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            subcategory: { type: 'string' },
                            percent: { type: 'number' },
                            status: { type: 'string' }
                        }
                    }
                }
            }
        }
        , ...errorSchemas
    }
};

module.exports = postClearanceSalesSettingsSchema;
