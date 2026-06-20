const countersMstServices = require('../services/countersMstServices');

function getCountersMstHandler(fastify) {
  const getCountersMst = countersMstServices.getCountersMstService(fastify);

  return async (request, reply) => {
    const { query, logTrace } = request;
    const response = await getCountersMst({ query, logTrace });
    return reply.code(200).send(response);
  };
}

module.exports = getCountersMstHandler;
