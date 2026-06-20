const payTypesRepo = require("../repository/payTypesRepo");


function getPayTypesService(fastify) {
  const { getPayTypesList } = payTypesRepo(fastify);

  return async ({ logTrace, query, params }) => {
    const knex = fastify.knexMedical;
    const response = await getPayTypesList.call(knex, {
      logTrace,
      params,
      queryString: query
    });
    return response;
  };
}

function getOutletMembersInfoService(fastify) {
  const { getOutletMemberInfo } = outletMembersRepo(fastify);

  return async ({ params, logTrace }) => {
    const knex = fastify.knexMedical;
    const response = await getOutletMemberInfo.call(knex, {
      params,
      logTrace
    });
    return response;
  };
}

function postPayTypeService(fastify) {
  const { postPayType } = payTypesRepo(fastify);
  return async ({ params, body, logTrace, userDetails }) => {
    const knex = fastify.knexMedical;
    const promise1 = postPayType.call(knex, {
      params,
      body,
      logTrace, userDetails
    });
    const [response] = await Promise.all([promise1]);
    return response;
  };
}

function putPayTypeService(fastify) {
  const { putPayType } = payTypesRepo(fastify);

  return async ({ params, body, logTrace, userDetails }) => {
    const knex = fastify.knexMedical;

    const { pay_type_id } = params;

    const promise = putPayType.call(knex, {
      pay_type_id,
      body,
      logTrace,
      userDetails
    });

    const [response] = await Promise.all([promise]);
    return response;
  };
}

function deletePayTypeService(fastify) {
  const { deletePayType } = payTypesRepo(fastify);
  return async ({ params, body, logTrace, userDetails }) => {
    const knex = fastify.knexMedical;
    const { pay_type_id } = params;
    const promise1 = deletePayType.call(knex, {
      pay_type_id,
      body,
      logTrace,
      userDetails
    });
    const [response] = await Promise.all([promise1]);
    return response;
  };
}

module.exports = {
  getPayTypesService,
  postPayTypeService,
  putPayTypeService,
  deletePayTypeService
};
