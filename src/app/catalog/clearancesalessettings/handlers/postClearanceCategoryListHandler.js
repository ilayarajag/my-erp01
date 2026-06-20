const clearanceSalesSettingsServices = require('../services/clearanceSalesSettingsServices');

function postClearanceCategoryListHandler(fastify) {
  const postClearanceCategoryList = clearanceSalesSettingsServices.postClearanceCategoryListService(fastify);

  return async (request, reply) => {
    const { body, params, logTrace, userDetails } = request;
    const response = await postClearanceCategoryList({ body, params, logTrace, userDetails });
    return reply.code(200).send(response);
  };
}

module.exports = postClearanceCategoryListHandler;
