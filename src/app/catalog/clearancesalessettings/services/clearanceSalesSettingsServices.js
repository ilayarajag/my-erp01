const clearanceSalesSettingsRepo = require('../repository/clearanceSalesSettingsRepo');

function postClearanceCategoryListService(fastify) {
    const { postClearanceCategoryList } = clearanceSalesSettingsRepo(fastify);

    return async ({ body, params, logTrace, userDetails }) => {
        const knex = fastify.knexMedical;
        const response = await postClearanceCategoryList.call(knex, {
            body,
            params,
            logTrace,
            userDetails
        });
        return response;
    };
}
function postClearanceCategoryListPageService(fastify) {
    const { postClearanceCategoryListPage } = clearanceSalesSettingsRepo(fastify);

    return async ({ body, params, logTrace, userDetails }) => {
        const knex = fastify.knexMedical;
        const response = await postClearanceCategoryListPage.call(knex, {
            body,
            params,
            logTrace,
            userDetails
        });
        return response;
    };
}

function postClearanceSalesSettingsService(fastify) {
    const { postClearanceSalesSettings } = clearanceSalesSettingsRepo(fastify);

    return async ({ body, logTrace, userDetails }) => {
        const knex = fastify.knexMedical;
        const response = await postClearanceSalesSettings.call(knex, {
            body,
            logTrace,
            userDetails
        });
        return response;
    };
}

function exportClearanceSalesSettingsService(fastify) {
    const { exportClearanceSalesSettings } = clearanceSalesSettingsRepo(fastify);

    return async ({ body, logTrace, userDetails }) => {
        const knex = fastify.knexMedical;
        const response = await exportClearanceSalesSettings.call(knex, {
            body,
            logTrace,
            userDetails
        });
        return response;
    };
}


module.exports = {
    postClearanceCategoryListService,
    postClearanceCategoryListPageService,
    postClearanceSalesSettingsService,
    exportClearanceSalesSettingsService
};
