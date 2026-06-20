const storeManagerServices = require("../services/storeManagerServices");

function getStoreManagerInfoHandler(fastify) {
  const getStoreManagerInfo = storeManagerServices.getStoreManagerInfoService(fastify);
  return async (request, reply) => {
    const { params, logTrace, userDetails } = request;
    const response = await getStoreManagerInfo({ params, logTrace, userDetails });
    return reply.code(200).send(response);
  };
}

module.exports = getStoreManagerInfoHandler;
