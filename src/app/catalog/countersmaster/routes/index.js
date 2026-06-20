const schemas = require('../schemas');
const handlers = require('../handlers');

module.exports = async fastify => {

    fastify.route({
        method: 'GET',
        url: '/counters/master',
        preHandler: fastify.authenticate,
        schema: schemas.getCountersMstSchema,
        handler: handlers.getCountersMstHandler(fastify)
    });
};
