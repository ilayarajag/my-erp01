const itemWiseSalesRepo = require("../repository/itemwisesales");

function itemWiseSalesService(fastify) {
  const { getItemWiseSales } = itemWiseSalesRepo(fastify);
  return async ({ body, logTrace }) => {
    return getItemWiseSales.call(fastify.knexMedical, { body, logTrace });
  };
}

module.exports = { itemWiseSalesService };
