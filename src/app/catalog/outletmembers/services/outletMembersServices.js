const outletMembersRepo = require("../repository/outletMembersRepo");


function getOutletMembersListService(fastify) {
  const { getOutletMembersList } = outletMembersRepo(fastify);

  return async ({ logTrace, query, params }) => {
    const knex = fastify.knexMedical;
    const response = await getOutletMembersList.call(knex, {
      logTrace,
      params,
      queryString: query
    });
    return response;
  };
}

function getOutletListService(fastify) {
  const { getOutletsList } = outletMembersRepo(fastify);

  return async ({ logTrace, query, params, userDetails }) => {
    const knex = fastify.knexMedical;
    const response = await getOutletsList.call(knex, {
      logTrace,
      params,
      userDetails,
      queryString: query
    });
    return response;
  };
}

function getOutletMembersInfoInfoService(fastify) {
  const {
    getOutletMemberInfoInfo,
   } = outletMembersRepo(fastify);

  return async ({ params, logTrace }) => {
    const knex = fastify.knexMedical;

    const response1 = await getOutletMemberInfoInfo.call(knex, {
      params,
      logTrace
    });

    

    let result = response1?.response?.data;

    
    let response = {
      success: response1?.response?.success,
      status: response1?.response?.status,

      // MUST BE data (not response)
      data: {
        MemberEntryCount: result?.MemberEntryCount,

        user: {
          MName: result?.user?.MName,
          MCardNo: result?.user?.MCardNo,
          Address1: result?.user?.Address1,
          address2: result?.user?.address2,
          address3: result?.user?.address3,
          city: result?.user?.city,
          pincode: result?.user?.pincode,
          mobile: result?.user?.mobile,
          email: result?.user?.email,
          points: result?.user?.points,
          Amount: result?.user?.Amount,
          active: result?.user?.active,
          clientid: result?.user?.clientid,
          Locid: result?.user?.Locid,
          jdate: result?.user?.jdate,
          LPDate: result?.user?.LPDate,
          wallet: result?.user?.wallet,
          Mid: result?.user?.Mid,
          custtype: result?.user?.custtype,
          Jdate: result?.user?.Jdate,

          locationdetails: {
            LocId: result?.user?.locationdetails?.LocId,
            LocName: result?.user?.locationdetails?.LocName
          },

          loyalty_otp_threshold:
            result?.user?.loyalty_otp_threshold,

          nso_offer_redeemed:
            result?.user?.nso_offer_redeemed,

          online_activated:
            result?.user?.online_activated
        }
      }
    };

    return response;
  };
}
function getOutletMembersInfoService(fastify) {
  const {  getOutletMemberInfo } = outletMembersRepo(fastify);

  return async ({ params, logTrace }) => {
    const knex = fastify.knexMedical;

    const response = await  getOutletMemberInfo.call(knex, {
      params,
      logTrace
    });
//  const [response] = await Promise.all([promise1]);
 
    return response;
  };
}
function postOutletMemberService(fastify) {
  const { postOutletMember } = outletMembersRepo(fastify);
  return async ({ params, body, logTrace, userDetails }) => {
    const knex = fastify.knexMedical;
    const promise1 = postOutletMember.call(knex, {
      params,
      body,
      logTrace, userDetails
    });
    const [response] = await Promise.all([promise1]);
    return response;
  };
}

function putOutletMemberService(fastify) {
  const { putOutletMember } = outletMembersRepo(fastify);
  return async ({ params, body, logTrace, userDetails }) => {
    const knex = fastify.knexMedical;
    const { member_id } = params;
    const promise1 = putOutletMember.call(knex, {
      member_id,
      body,
      logTrace, userDetails
    });
    const [response] = await Promise.all([promise1]);
    return response;
  };
}

function deleteOutletMemberService(fastify) {
  const { deleteOutletMember } = outletMembersRepo(fastify);
  return async ({ params, body, logTrace, userDetails }) => {
    const knex = fastify.knexMedical;
    const { member_id } = params;
    const promise1 = deleteOutletMember.call(knex, {
      member_id,
      body,
      logTrace,
      userDetails
    });
    const [response] = await Promise.all([promise1]);
    return response;
  };
}

function getDeviceTypeService(fastify) {
  const { getDeviceType } = deviceRepo(fastify);

  return async ({ logTrace }) => {
    const knex = fastify.knexMedical;
    const response = await getDeviceType.call(knex, {
      logTrace
    });
    return response;
  };
}

module.exports = {
  getOutletMembersListService,
  getOutletMembersInfoService,
  postOutletMemberService,
  putOutletMemberService,
  deleteOutletMemberService,
  getDeviceTypeService,
  getOutletListService,
  getOutletMembersInfoInfoService
};
