const schemas = require('../schemas');
const handlers = require('../handlers');

module.exports = async fastify => {
    fastify.route({
        method: 'POST',
        url: '/outlet/settings',
        preHandler: fastify.authenticate,
        schema: schemas.postOutletSettingSchema,
        handler: handlers.postOutletSettingHandler(fastify)
    });

    fastify.route({
        method: 'GET',
        url: '/outlet/settings/:outlet_settings_master_id',
        preHandler: fastify.authenticate,
        schema: schemas.getOutletSettingsSchema,
        handler: handlers.getOutletSettingsHandler(fastify)
    });
};
