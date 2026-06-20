const outletSettingsRepo = require('../repository/outletSettingsRepo');

function postOutletSettingService(fastify) {
    const { postOutletSetting } = outletSettingsRepo(fastify);

    return async ({ body, logTrace, userDetails }) => {
        const knex = fastify.knexMedical;
        const response = await postOutletSetting.call(knex, {
            body,
            logTrace,
            userDetails
        });
        return response;
    };
}

function getOutletSettingsService(fastify) {
    const { getOutletSettings } = outletSettingsRepo(fastify);

    return async ({ params, query, logTrace }) => {
        const knex = fastify.knexMedical;
        const response = await getOutletSettings.call(knex, {
            params,
            query,
            logTrace
        });
        return response;
    };
}

module.exports = {
    postOutletSettingService,
    getOutletSettingsService
};
