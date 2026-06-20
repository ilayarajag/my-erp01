const { StatusCodes } = require('http-status-codes');
const { CustomError } = require('../../../errorHandler');
const { logQuery } = require('../../../commons/helpers');
const { COUNTERS_MASTER } = require('../commons/constants');

function countersMstRepo(fastify) {

    async function getCountersMst({ logTrace }) {
        const knex = this;

        const query = knex(COUNTERS_MASTER.NAME)
            .select([
                COUNTERS_MASTER.COLUMNS.ID,
                COUNTERS_MASTER.COLUMNS.COUNTER_NAME,
                COUNTERS_MASTER.COLUMNS.COUNTER_NO,
                COUNTERS_MASTER.COLUMNS.IS_ACTIVE
            ])
            .orderBy(COUNTERS_MASTER.COLUMNS.ID, 'asc');

        logQuery({
            logger: fastify.log,
            query,
            context: 'get counters Master',
            logTrace
        });

        const response = await query;

        if (!response.length) {
            throw CustomError.create({
                httpCode: StatusCodes.NOT_FOUND,
                message: 'Counters not found',
                code: 'NOT_FOUND'
            });
        }

        return response;
    }

    return {
        getCountersMst
    };
}

module.exports = countersMstRepo;
