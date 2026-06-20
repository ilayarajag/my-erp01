const { StatusCodes } = require("http-status-codes");
const { CustomError } = require("../../../errorHandler");
const { logQuery } = require("../../../commons/helpers");
const { OUTLET_MEMBERS, OUTLETS, } = require("../commons/constants");
const { OUTLET_MAPPING } = require("../../../accounts/admin/commons/constants");
const { SETTING } = require("../../../sales/commons/constants");
const axios = require("axios");

function outletMembersRepo(fastify) {


  async function getOutletMembersList({
    body,
    params,
    logTrace,
    queryString
  }) {
    const knex = this;

    const searchText = queryString.search?.trim();
    const pageSize = Number(params.page_size) || 10;
    const currentPage = Number(params.current_page) || 1;
     let result =  knex(SETTING.NAME).select(SETTING.NAME + ".*");
     let res_result = await result;
      let reedem_amount = 0;
      let reedem_points = 0;
      let reedem_percentage = 0;
    if(res_result){
         reedem_amount = res_result[0].ramount;
      reedem_points = res_result[0].rpoint;
      reedem_percentage = res_result[0].rpercent;
    }
   
    const query = knex(OUTLET_MEMBERS.NAME)
      .where(OUTLET_MEMBERS.COLUMNS.IS_ACTIVE, true)

    if (searchText) {
      query.where(function () {
        this.where(
          `${OUTLET_MEMBERS.NAME}.${OUTLET_MEMBERS.COLUMNS.MOBILE}`,
          "ilike",
          `%${searchText}%`
        ).orWhere(
          `${OUTLET_MEMBERS.NAME}.${OUTLET_MEMBERS.COLUMNS.PARTY_NAME}`,
          "ilike",
          `%${searchText}%`
        );
      });
    }

    query.orderBy(
      `${OUTLET_MEMBERS.NAME}.${OUTLET_MEMBERS.COLUMNS.ID}`,
      "desc"
    );

    const response = await query.paginate({
      pageSize,
      currentPage
    });

    if (response.meta.pagination.total_pages < currentPage) {
      response.data = [];
    }

    if (!response.data.length && currentPage === 1) {
      response.data = [];
    }


    response.data = response.data.map(member => ({
      ...member,
         id : member.id,
         mobile : member.mobile || 0,
         party_name : member.party_name || "",
         email : member.email || "",
         gst_in : member.gst_in || "",
         balance_points: Math.round( Number(member.balance_points) * Number(reedem_percentage) / 100 ) || 0,
         wallet_amount : member.wallet_amount || 0,
         is_active : member.is_active,
         created_at : member.created_at,
         updated_at : member.updated_at,
         created_by : member.created_by,
         updated_by : member.updated_by,
         customer_type: member.gst_in ? "B2B" : "B2C",
         reedem_amount:reedem_amount || 0,
         reedem_points:reedem_points || 0
    }));

    return response;
  }
  async function getOutletsList({
    body,
    params,
    logTrace,
    queryString,
    userDetails
  }) {
    const knex = this;

    const company_id = userDetails.company_id;
    const user_id = userDetails.id;
    console.log("userr", user_id);


    const query = knex(OUTLETS.NAME)
      .select([
        `${OUTLETS.NAME}.${OUTLETS.COLUMNS.ID} as outlet_id`,
        `${OUTLETS.NAME}.${OUTLETS.COLUMNS.SHORT_NAME} as short_name`,
        `${OUTLETS.NAME}.${OUTLETS.COLUMNS.FULL_NAME} as fullname`,
        `${OUTLETS.NAME}.${OUTLETS.COLUMNS.REGION_ID} as code`
      ])
      .innerJoin(
        OUTLET_MAPPING.NAME,
        `${OUTLETS.NAME}.${OUTLETS.COLUMNS.ID}`,
        `${OUTLET_MAPPING.NAME}.${OUTLET_MAPPING.COLUMNS.OUTLET_ID}`
      )
      .where(
        `${OUTLETS.NAME}.${OUTLETS.COLUMNS.COMPANY_ID}`,
        company_id
      )
      .andWhere(
        `${OUTLET_MAPPING.NAME}.${OUTLET_MAPPING.COLUMNS.USER_ID}`,
        user_id
      )
      .orderBy(
        `${OUTLETS.NAME}.${OUTLETS.COLUMNS.ID}`,
        "asc"
      );

    logQuery({
      logger: fastify.log,
      query,
      context: "Get OUTLET MEMBERS",
      logTrace
    });
    console.log("query", query.toString());

    const response = await query;

    if (!response.length) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_FOUND,
        message: "OUTLET MEMBERS not found",
        code: "NOT_FOUND"
      });
    }

    return { data: response };
  }

  async function getOutletMemberInfo({ params, logTrace }) {
    const knex = this;

    const query = knex(OUTLET_MEMBERS.NAME)
      .select(
        `${OUTLET_MEMBERS.NAME}.*`,
      ).where(`${OUTLET_MEMBERS.NAME}.${OUTLET_MEMBERS.COLUMNS.ID}`, params.member_id);
    // .andWhere(`${OUTLET_MEMBERS.NAME}.${OUTLET_MEMBERS.COLUMNS.IS_ACTIVE}`, true);

    logQuery({
      logger: fastify.log,
      query,
      context: "Get Outlet member Info",
      logTrace
    });
    const response = await query;
    if (!response.length) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_FOUND,
        message: "Outlet member not found",
        property: "",
        code: "NOT_FOUND"
      });
    }
    // const { created_by, updated_by, ...filteredData } = response[0];
    return response;

  }

  //  async function getOutletMemberInfo({ params, logTrace }) {
  //   const knex = this;
  //   const query = knex(OUTLET_MEMBERS.NAME)
  //     .select(
  //       `${OUTLET_MEMBERS.NAME}.*`,
  //     ).where(`${OUTLET_MEMBERS.NAME}.${OUTLET_MEMBERS.COLUMNS.MOBILE}`, params.mobile);
  //   // .andWhere(`${OUTLET_MEMBERS.NAME}.${OUTLET_MEMBERS.COLUMNS.IS_ACTIVE}`, true);

  //   logQuery({
  //     logger: fastify.log,
  //     query,
  //     context: "Get Outlet member Info",
  //     logTrace
  //   });
  //   const response = await query;
  //   console.log("member", response);

  //   if (!response.length) {
  //     throw CustomError.create({
  //       httpCode: StatusCodes.NOT_FOUND,
  //       message: "Outlet member not found",
  //       property: "",
  //       code: "NOT_FOUND"
  //     });
  //   }
  //   // const { created_by, updated_by, ...filteredData } = response[0];
  //    let axiosUrl = axios.get(`http://api1.kovaipazhamudir.com/api/FetchMember`,{
  //       mobile: params.mobile,
  //    });
  //    console.log("axiosUrl", axiosUrl);
  //   return response;

  // }

  async function getOutletMemberInfoInfo({ params, logTrace }) {
    const knex = this;

    const query = knex(OUTLET_MEMBERS.NAME)
      .select(`${OUTLET_MEMBERS.NAME}.*`)
      .modify((qb) => {

        // 🔹 Mobile Search
        if (params.mobile) {
          qb.where(
            `${OUTLET_MEMBERS.NAME}.${OUTLET_MEMBERS.COLUMNS.MOBILE}`,
            params.mobile
          );
        }

        // 🔹 Member ID Search
        if (params.member_id) {
          if (params.mobile) {
            qb.orWhere(
              `${OUTLET_MEMBERS.NAME}.${OUTLET_MEMBERS.COLUMNS.ID}`,
              params.member_id
            );
          } else {
            qb.where(
              `${OUTLET_MEMBERS.NAME}.${OUTLET_MEMBERS.COLUMNS.ID}`,
              params.member_id
            );
          }
        }
      });

    console.log("query", query.toString());

    logQuery({
      logger: fastify.log,
      query,
      context: "Get Outlet Member Info",
      logTrace
    });

    const responses = await query;

    if (!responses.length) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_FOUND,
        message: "Outlet member not found",
        property: "",
        code: "NOT_FOUND"
      });
    }

    // 🔹 API Mobile
    const mobile =
      params.mobile || responses[0]?.mobile;

    let api_response = null;

    try {

      // 🔹 API Call
      const axiosResponse = await axios.get(
        "http://api1.kovaipazhamudir.com/api/FetchMember",
        {
          params: {
            mobile: mobile
          },
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      api_response = axiosResponse.data;

      //console.log("axiosResponse", api_response);

    } catch (error) {

      console.error("API ERROR =>", {
        message: error.message,
        data: error.response?.data,
        status: error.response?.status
      });

      throw error;
    }

    return {
      success: true,
      response: api_response,
      api_response
    };
  }

  // async function postOutletMember({ params, body, logTrace, userDetails }) {
  //   const knex = this;

  //   // 🔹 Check duplicate mobile (unique customer)
  //   if (body.mobile) {
  //     const existsMobile = await knex(OUTLET_MEMBERS.NAME)
  //       .where(OUTLET_MEMBERS.COLUMNS.MOBILE, body.mobile)
  //       .first();

  //     if (existsMobile) {
  //       throw CustomError.create({
  //         httpCode: StatusCodes.NOT_ACCEPTABLE,
  //         message: "Mobile Number Already Exists",
  //         property: "mobile",
  //         code: "NOT_ACCEPTABLE"
  //       });
  //     }
  //   }

  //   // 🔹 Check duplicate GSTIN (for business customers)
  //   if (body.gst_in) {
  //     const existsGST = await knex(OUTLET_MEMBERS.NAME)
  //       .whereRaw(`LOWER(${OUTLET_MEMBERS.COLUMNS.GST_IN}) = LOWER(?)`, [body.gst_in])
  //       .first();

  //     if (existsGST) {
  //       throw CustomError.create({
  //         httpCode: StatusCodes.NOT_ACCEPTABLE,
  //         message: "GSTIN Already Exists",
  //         property: "gst_in",
  //         code: "NOT_ACCEPTABLE"
  //       });
  //     }
  //   }
  //   let mobile = body.mobile?.trim();

  //   if (mobile) {
  //     mobile = mobile.replace(/\s+/g, "");
  //   }
  //   if (mobile && !/^[6-9][0-9]{9}$/.test(mobile)) {
  //     throw CustomError.create({
  //       httpCode: 400,
  //       message: "Invalid mobile number",
  //       code: "INVALID_MOBILE"
  //     });
  //   }
  //   const [inserted] = await knex(OUTLET_MEMBERS.NAME)
  //     .insert({
  //       [OUTLET_MEMBERS.COLUMNS.MOBILE]: mobile || null,
  //       [OUTLET_MEMBERS.COLUMNS.PARTY_NAME]: body.party_name || null,
  //       [OUTLET_MEMBERS.COLUMNS.EMAIL]: body.email || null,
  //       [OUTLET_MEMBERS.COLUMNS.GST_IN]: body.gst_in || null,
  //       [OUTLET_MEMBERS.COLUMNS.BALANCE_POINTS]: body.balance_points || 0,
  //       [OUTLET_MEMBERS.COLUMNS.CREATED_BY]: userDetails.id
  //     })
  //     .returning(["id"]);

  //   const insertedId = inserted?.id;

  //   if (!insertedId) {
  //     throw CustomError.create({
  //       httpCode: StatusCodes.NOT_IMPLEMENTED,
  //       message: "Error while creating Outlet Member",
  //       property: "",
  //       code: "NOT_IMPLEMENTED"
  //     });
  //   }

  //   return {
  //     success: true,
  //     insert_id: insertedId
  //   };
  // }
  async function postOutletMember({
    params,
    body,
    logTrace,
    userDetails
  }) {
    const knex = this;

    // 🔹 Mobile validation
    let mobile = body.mobile?.trim()?.replace(/\s+/g, "");

    if (mobile && !/^[6-9][0-9]{9}$/.test(mobile)) {
      throw CustomError.create({
        httpCode: StatusCodes.BAD_REQUEST,
        message: "Invalid mobile number",
        property: "mobile",
        code: "INVALID_MOBILE"
      });
    }

    // 🔹 Check duplicate mobile
    if (mobile) {
      const existsMobile = await knex(OUTLET_MEMBERS.NAME)
        .where(OUTLET_MEMBERS.COLUMNS.MOBILE, mobile)
        .first();

      if (existsMobile) {
        throw CustomError.create({
          httpCode: StatusCodes.NOT_ACCEPTABLE,
          message: "Mobile Number Already Exists",
          property: "mobile",
          code: "NOT_ACCEPTABLE"
        });
      }
    }

    // 🔹 Check duplicate GSTIN
    if (body.gst_in) {
      const existsGST = await knex(OUTLET_MEMBERS.NAME)
        .whereRaw(
          `LOWER(${OUTLET_MEMBERS.COLUMNS.GST_IN}) = LOWER(?)`,
          [body.gst_in.trim()]
        )
        .first();

      if (existsGST) {
        throw CustomError.create({
          httpCode: StatusCodes.NOT_ACCEPTABLE,
          message: "GSTIN Already Exists",
          property: "gst_in",
          code: "NOT_ACCEPTABLE"
        });
      }
    }

    // 🔹 Default values
    const card_no = body.card_no || "9999999999";
    const address = body.address || "covai";
    const city = body.city || "covai";
    const pincode = body.pincode || "123456";
    const points = 0;
    const amount = 0;

    // 🔹 Insert Member
    const [inserted] = await knex(OUTLET_MEMBERS.NAME)
      .insert({
        [OUTLET_MEMBERS.COLUMNS.MOBILE]: mobile,
        [OUTLET_MEMBERS.COLUMNS.PARTY_NAME]:
          body.party_name || null,
        [OUTLET_MEMBERS.COLUMNS.EMAIL]:
          body.email || null,
        [OUTLET_MEMBERS.COLUMNS.GST_IN]:
          body.gst_in || null,
        [OUTLET_MEMBERS.COLUMNS.BALANCE_POINTS]:
          points,
        [OUTLET_MEMBERS.COLUMNS.WALLET_AMOUNT]:
          amount,
        [OUTLET_MEMBERS.COLUMNS.OUTLET_ID]:
          userDetails.outlet_id,
        [OUTLET_MEMBERS.COLUMNS.CARD_NO]:
          card_no,
        [OUTLET_MEMBERS.COLUMNS.ADDRESS]:
          address,
        [OUTLET_MEMBERS.COLUMNS.CITY]:
          city,
        [OUTLET_MEMBERS.COLUMNS.PINCODE]:
          pincode,
        [OUTLET_MEMBERS.COLUMNS.CREATED_BY]:
          userDetails.id
      })
      .returning(["id"]);

    const insertedId = inserted?.id;

    if (!insertedId) {
      throw CustomError.create({
        httpCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Error while creating Outlet Member",
        property: "",
        code: "NOT_IMPLEMENTED"
      });
    }

    // 🔹 Current IST Date Time
    const now = new Date();

    const jdate =
      now.getFullYear() +
      "-" +
      String(now.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(now.getDate()).padStart(2, "0") +
      " " +
      String(now.getHours()).padStart(2, "0") +
      ":" +
      String(now.getMinutes()).padStart(2, "0") +
      ":" +
      String(now.getSeconds()).padStart(2, "0");

    let api_response = null;

    try {
      // 🔹 API Call
      const payload = {
        MName: body.party_name || "",
        MCardNo: card_no,
        Address1: address,
        city: city,
        pincode: pincode,
        mobile: mobile,
        points: String(points),
        Amount: String(amount),
        Locid: String(userDetails.outlet_id || 1),
        LPDate: jdate,
        jdate: jdate,
        client: 1
      };

      console.log("CreateMember Payload", payload);

      const axiosResponse = await axios.post(
        "http://api1.kovaipazhamudir.com/api/CreateMember",
        payload,
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      console.log("API Response", axiosResponse.data);

      api_response = axiosResponse.data;

    } catch (error) {

      console.error("API ERROR =>", {
        message: error.message,
        data: error.response?.data,
        status: error.response?.status
      });

      throw error;
    }

    return {
      success: true,
      insert_id: insertedId,
      api_response
    };
  }
  // async function putOutletMember({ member_id, body, logTrace, userDetails }) {
  //   const knex = this;

  //   // Check member exists
  //   const exists_response = await knex(OUTLET_MEMBERS.NAME)
  //     .where(OUTLET_MEMBERS.COLUMNS.ID, member_id)
  //     .first();

  //   if (!exists_response) {
  //     throw CustomError.create({
  //       httpCode: StatusCodes.NOT_ACCEPTABLE,
  //       message: "Outlet Member not found to update",
  //       property: "",
  //       code: "NOT_ACCEPTABLE"
  //     });
  //   }

  //   let mobile = body.mobile?.trim();

  //   if (mobile) {
  //     mobile = mobile.replace(/\s+/g, "");
  //   }
  //   if (mobile && !/^[6-9][0-9]{9}$/.test(mobile)) {
  //     throw CustomError.create({
  //       httpCode: 400,
  //       message: "Invalid mobile number",
  //       code: "INVALID_MOBILE"
  //     });
  //   }
  //   if (body?.mobile) {
  //     const mobile_exists = await knex(OUTLET_MEMBERS.NAME)
  //       .whereRaw("LOWER(mobile) = LOWER(?)", [body.mobile])
  //       .whereNot(OUTLET_MEMBERS.COLUMNS.ID, member_id)
  //       .first();

  //     if (mobile_exists) {
  //       throw CustomError.create({
  //         httpCode: StatusCodes.NOT_ACCEPTABLE,
  //         message: "Mobile already exists",
  //         property: "mobile",
  //         code: "NOT_ACCEPTABLE"
  //       });
  //     }
  //   }
  //   const updatePayload = {
  //     ...(body.mobile && { [OUTLET_MEMBERS.COLUMNS.MOBILE]: mobile }),
  //     ...(body.party_name && { [OUTLET_MEMBERS.COLUMNS.PARTY_NAME]: body.party_name }),
  //     ...(body.email && { [OUTLET_MEMBERS.COLUMNS.EMAIL]: body.email }),
  //     ...(body.gst_in && { [OUTLET_MEMBERS.COLUMNS.GST_IN]: body.gst_in }),
  //     ...(body.balance_points !== undefined && { [OUTLET_MEMBERS.COLUMNS.BALANCE_POINTS]: body.balance_points }),
  //     ...(body.is_active !== undefined && { [OUTLET_MEMBERS.COLUMNS.IS_ACTIVE]: body.is_active }),

  //     // System fields
  //     [OUTLET_MEMBERS.COLUMNS.UPDATED_BY]: userDetails.id,
  //     [OUTLET_MEMBERS.COLUMNS.UPDATED_AT]: knex.fn.now()
  //   };

  //   const query_update = await knex(OUTLET_MEMBERS.NAME)
  //     .where(OUTLET_MEMBERS.COLUMNS.ID, member_id)
  //     .update(updatePayload);

  //   if (!query_update) {
  //     throw CustomError.create({
  //       httpCode: StatusCodes.NOT_IMPLEMENTED,
  //       message: "Error while updating Outlet Member",
  //       property: "",
  //       code: "NOT_IMPLEMENTED"
  //     });
  //   }

  //   return { success: true };
  // }
  async function putOutletMember({
    member_id,
    body,
    logTrace,
    userDetails
  }) {
    const knex = this;

    // Check member exists
    const exists_response = await knex(OUTLET_MEMBERS.NAME)
      .where(OUTLET_MEMBERS.COLUMNS.ID, member_id)
      .first();
    console.log("exists_response", exists_response, body);
    let mobile = exists_response.mobile ? exists_response.mobile : body.mobile?.trim();
    if (!exists_response) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_ACCEPTABLE,
        message: "Outlet Member not found to update",
        property: "",
        code: "NOT_ACCEPTABLE"
      });
    }

    // Mobile validation
    // mobile = body.mobile?.trim();

    if (mobile) {
      mobile = mobile.replace(/\s+/g, "");
    }

    if (mobile && !/^[6-9][0-9]{9}$/.test(mobile)) {
      throw CustomError.create({
        httpCode: 400,
        message: "Invalid mobile number",
        code: "INVALID_MOBILE"
      });
    }

    // Duplicate mobile check
    if (body?.mobile) {
      const mobile_exists = await knex(OUTLET_MEMBERS.NAME)
        .whereRaw("LOWER(mobile) = LOWER(?)", [mobile])
        .whereNot(OUTLET_MEMBERS.COLUMNS.ID, member_id)
        .first();

      if (mobile_exists) {
        throw CustomError.create({
          httpCode: StatusCodes.NOT_ACCEPTABLE,
          message: "Mobile already exists",
          property: "mobile",
          code: "NOT_ACCEPTABLE"
        });
      }
    }

    // Update payload
    const updatePayload = {
      ...(body.mobile && {
        [OUTLET_MEMBERS.COLUMNS.MOBILE]: mobile
      }),

      ...(body.party_name && {
        [OUTLET_MEMBERS.COLUMNS.PARTY_NAME]: body.party_name
      }),

      ...(body.email && {
        [OUTLET_MEMBERS.COLUMNS.EMAIL]: body.email
      }),

      ...(body.gst_in && {
        [OUTLET_MEMBERS.COLUMNS.GST_IN]: body.gst_in
      }),

      ...(body.balance_points !== undefined && {
        [OUTLET_MEMBERS.COLUMNS.BALANCE_POINTS]: Number(body.balance_points)
      }),

      ...(body.is_active !== undefined && {
        [OUTLET_MEMBERS.COLUMNS.IS_ACTIVE]:
          body.is_active
      }),

      [OUTLET_MEMBERS.COLUMNS.UPDATED_BY]:
        userDetails.id,

      [OUTLET_MEMBERS.COLUMNS.UPDATED_AT]:
        knex.fn.now()
    };

    // Update DB
    const query_update = await knex(OUTLET_MEMBERS.NAME)
      .where(OUTLET_MEMBERS.COLUMNS.ID, member_id)
      .update(updatePayload);

    if (!query_update) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_IMPLEMENTED,
        message: "Error while updating Outlet Member",
        property: "",
        code: "NOT_IMPLEMENTED"
      });
    }
    const createDate = new Date();
    const jdate = new Date(createDate)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");
    console.log("createDate", jdate);
   console.log("checkmobile",mobile);
   
    // API Update
    const axiosUpdate = await axios({
      method: "POST",
      url: "http://api1.kovaipazhamudir.com/api/MembershipPointsUpdate",
      headers: {
        "Content-Type": "application/json"
      },
      data: {
        mobile: mobile,
        point: body.balance_points || 0,
        Amount: body.amount || 0,
        flag: "0",
        LPDate: jdate
      }

    });
    console.log("createDate", axiosUpdate.data);
    return {
      success: true,
      api_response: axiosUpdate.data
    };
  }
  async function deleteOutletMember({ member_id, logTrace, userDetails }) {
    const knex = this;

    const exists_response = await knex(OUTLET_MEMBERS.NAME)
      .where(OUTLET_MEMBERS.COLUMNS.ID, member_id)
      .first();

    if (!exists_response) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_ACCEPTABLE,
        message: "Outlet Member not found to delete",
        property: "",
        code: "NOT_ACCEPTABLE"
      });
    }

    //  Hard delete 
    const query = knex(OUTLET_MEMBERS.NAME)
      .where(OUTLET_MEMBERS.COLUMNS.ID, member_id)
      .del();

    logQuery({
      logger: fastify.log,
      query,
      context: "DELETE OUTLET MEMBER",
      logTrace
    });

    const response = await query;

    if (!response) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_IMPLEMENTED,
        message: "Error while deleting Outlet Member",
        property: "",
        code: "NOT_IMPLEMENTED"
      });
    }

    return { success: true };
  }

  return {
    getOutletMembersList,
    getOutletMemberInfo,
    postOutletMember,
    putOutletMember,
    deleteOutletMember,
    getOutletsList,
    getOutletMemberInfoInfo
  };
}

module.exports = outletMembersRepo;
