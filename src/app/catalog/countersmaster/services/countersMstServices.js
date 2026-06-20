const countersMstRepo = require('../repository/countersMstRepo');


function getCountersMstService(fastify) {
    const { getCountersMst } = countersMstRepo(fastify);

    return async ({ query, logTrace }) => {
        const knex = fastify.knexMedical;
        const response = await getCountersMst.call(knex, {
            query,
            logTrace
        });
        return response;
    };
}

module.exports = {
    getCountersMstService
};
