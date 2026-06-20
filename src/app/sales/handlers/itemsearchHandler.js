const itemsearchservices = require("../services/itemsearch");

function itemsearchHandlerinfo(fastify) {
  const getitemsearchInfo = itemsearchservices.itemsearchservices(fastify);
  return async (request, reply) => {
    const { body, params,query, logTrace, userDetails } = request;
    const response = await getitemsearchInfo({
      body,
      params,
      queryString:query,
      logTrace,
      userDetails
    });
    return reply.code(200).send(response);
  };
}

function dublicatebillHandlerinfo(fastify) {
    const getdubbillInfo = itemsearchservices.dubbillservices(fastify);
    return async (request, reply) => {
      const { body, params, logTrace, userDetails } = request;
      const response = await getdubbillInfo({
        body,
        params,
        logTrace,
        userDetails
      });
      return reply.code(200).send(response);
    };
  }

module.exports = {itemsearchHandlerinfo,dublicatebillHandlerinfo};
