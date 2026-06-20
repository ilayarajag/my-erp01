const { itemWiseSalesService } = require("../services/itemWiseSalesService");

function itemWiseSalesHandler(fastify) {
  const getItemWiseSales = itemWiseSalesService(fastify);
  return async (request, reply) => {
    const { body, logTrace } = request;
    const response = await getItemWiseSales({ body, logTrace });
    return reply.code(200).send(response);
  };
}

module.exports = itemWiseSalesHandler;
