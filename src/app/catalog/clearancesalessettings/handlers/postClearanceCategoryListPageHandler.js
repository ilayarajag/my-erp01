

const clearanceSalesSettingsServices = require('../services/clearanceSalesSettingsServices');

function postClearanceCategoryListPageHandler(fastify) {
  const postClearanceCategoryListPage = clearanceSalesSettingsServices.postClearanceCategoryListPageService(fastify);

  return async (request, reply) => {
    const { body, params, logTrace, userDetails } = request;
    const response = await postClearanceCategoryListPage({ body, params, logTrace, userDetails });
    return reply.code(200).send(response);
  };
}

module.exports = postClearanceCategoryListPageHandler;
