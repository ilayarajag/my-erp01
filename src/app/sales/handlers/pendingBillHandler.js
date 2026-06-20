
const billServices = require("../services/billServices");


function pendingBillHandlerinfo(fastify) {
    const getpendingbillInfo = billServices.bendingBillServices(fastify);
    return async (request, reply) => {
      const { body, params, logTrace, userDetails } = request;
      const response = await getpendingbillInfo({
        body,
        params,
        logTrace,
        userDetails
      });
      return reply.code(200).send(response);
    };
  }

  function pendingBillretrieveHandlerinfo(fastify) {
    const getpendingretrievebillInfo = billServices.bendingBillretrieveServices(fastify);
    return async (request, reply) => {
      const { body, params, logTrace, userDetails } = request;
      const response = await getpendingretrievebillInfo({
        body,
        params,
        logTrace,
        userDetails
      });
      return reply.code(200).send(response);
    };
  }
  function pendingBilloverallgetHandlerinfo(fastify) {
    const getpendingoverallgetInfo = billServices.bendingBilloverallgetServices(fastify);
    return async (request, reply) => {
      const { body, params, logTrace, userDetails } = request;
      const response = await getpendingoverallgetInfo({
        body,
        params,
        logTrace,
        userDetails
      });
      return reply.code(200).send(response);
    };
  }
  module.exports = {pendingBillHandlerinfo,pendingBillretrieveHandlerinfo,pendingBilloverallgetHandlerinfo};