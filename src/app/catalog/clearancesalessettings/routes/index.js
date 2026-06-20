const schemas = require('../schemas');
const handlers = require('../handlers');

module.exports = async fastify => {

    // import excel to get (pagination)
    fastify.route({
        method: 'POST',
        url: '/clearance/sales/settings/excel/validation/:page_size/:current_page',
        preHandler: fastify.authenticate,
        schema: schemas.postClearanceCategoryListPageSchema,
        handler: handlers.postClearanceCategoryListPageHandler(fastify)
    });

    // import excel to get all data
    fastify.route({
        method: 'POST',
        url: '/clearance/sales/settings/excel/validation',
        preHandler: fastify.authenticate,
        schema: schemas.postClearanceCategoryListSchema,
        handler: handlers.postClearanceCategoryListHandler(fastify)
    });

    // create clearance sales settings 
    fastify.route({
        method: 'POST',
        url: '/clearance/sales/settings',
        preHandler: fastify.authenticate,
        schema: schemas.postClearanceSalesSettingsSchema,
        handler: handlers.postClearanceSalesSettingsHandler(fastify)
    });

    // excel to downlaod clearance sales settings 
    fastify.route({
        method: 'get',
        url: '/clearance/sales/settings/excel/export',
        preHandler: fastify.authenticate,
        schema: schemas.exportClearanceSalesSettingsSchema,
        handler: handlers.exportClearanceSalesSettingsHandler(fastify)
    });

};
