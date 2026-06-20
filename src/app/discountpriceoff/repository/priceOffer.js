const { StatusCodes } = require("http-status-codes");
const { CustomError } = require("../../errorHandler");
const { logQuery } = require("../../commons/helpers");
const { PRICEOFF, PRICEOFF_OUTLET, PRICEOFF_PARTNER, PRICEOFF_LOGS } = require("../commons/constants");
const { ITEM } = require("../commons/constants");
const { OUTLETS } = require("../../accounts/admin/commons/constants");

function OfferMasterRepo(fastify) {

  async function getOfferMasterPaginate({ queryString, params, logTrace }) {
    const knex = this;
    const { status, search, from_date, to_date } = queryString;

    // const query = knex
    //   .select([
    //     `${PRICEOFF.NAME}.*`,
    //     `${ITEM.NAME}.pro_name as product_name`, //  product name 
    //   ])
    //   .from(`${PRICEOFF.NAME}`)
    //   .leftJoin(
    //     `${ITEM.NAME}`,
    //     `${ITEM.NAME}.${ITEM.COLUMNS.PRODUCT_CODE}`,
    //     `${PRICEOFF.NAME}.${PRICEOFF.COLUMNS.PROD_CODE}`
    //   )
    //   .orderBy(`${PRICEOFF.NAME}.${PRICEOFF.COLUMNS.ID}`, "DESC");

    const query = knex
      .select([
        knex.raw('DISTINCT ON (??.??) ??.*', [PRICEOFF.NAME, PRICEOFF.COLUMNS.PID, PRICEOFF.NAME]),
        knex.raw('??.?? as ??', [ITEM.NAME, 'pro_name', 'product_name'])
      ])
      .from(PRICEOFF.NAME)
      .leftJoin(
        ITEM.NAME,
        `${ITEM.NAME}.${ITEM.COLUMNS.PRODUCT_CODE}`,
        `${PRICEOFF.NAME}.${PRICEOFF.COLUMNS.PROD_CODE}`
      )
      .orderBy([
        { column: `${PRICEOFF.NAME}.${PRICEOFF.COLUMNS.PID}`, order: 'desc' },
        { column: `${PRICEOFF.NAME}.${PRICEOFF.COLUMNS.ID}`, order: 'desc' }
      ]);

    if (Number(status) && Number(status) == 1) {
      query.where(
        `${PRICEOFF.NAME}.${PRICEOFF.COLUMNS.PACTIVE}`,
        1
      );
    }

    if (Number(status) && Number(status) == 2) {
      query.where(
        `${PRICEOFF.NAME}.${PRICEOFF.COLUMNS.PACTIVE}`,
        0
      );
    }

    if (search && search.length >= 3) {
      query.where(function () {
        this.where(PRICEOFF.COLUMNS.PNAME, "ilike", `%${search}%`);
      });
    }

    if (!from_date == '') {
      query.whereRaw(
        `DATE(${PRICEOFF.NAME}.${PRICEOFF.COLUMNS.PFROM}) >= ?`, from_date
      )
    }
    if (!to_date == '') {
      query.whereRaw(
        `DATE(${PRICEOFF.NAME}.${PRICEOFF.COLUMNS.PTO}) <= ?`, to_date
      )
    }
    logQuery({
      logger: fastify.log,
      query,
      context: "Get Price Offer Master",
      logTrace
    });
    const response = await query.paginate({
      pageSize: params.page_size, // Customize as needed
      currentPage: params.current_page // Customize as needed
    });
    if (!response.data.length) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_FOUND,
        message: "Price Offer  data not found",
        property: "",
        code: "NOT_FOUND"
      });
    }


    const responsewith_outletdetails = await Promise.all(
      response.data.map(async offers => {
        const outlets_lines = await knex
          .select([
            `${OUTLETS.NAME}.*`,
          ])
          .from(`${PRICEOFF_OUTLET.NAME} as ${PRICEOFF_OUTLET.NAME}`)
          .leftJoin(
            `${OUTLETS.NAME} as ${OUTLETS.NAME}`,
            `${PRICEOFF_OUTLET.NAME}.${PRICEOFF_OUTLET.COLUMNS.OUTLET_ID}`,
            `${OUTLETS.NAME}.${OUTLETS.COLUMNS.ID}`
          )
          .where(`${PRICEOFF_OUTLET.NAME}.${PRICEOFF_OUTLET.COLUMNS.PRICEOFF_ID}`, offers.pid);

        const partner_lines = await knex
          .select([
            `${PRICEOFF_PARTNER.NAME}.*`,
          ])
          .from(`${PRICEOFF_PARTNER.NAME} as ${PRICEOFF_PARTNER.NAME}`)
          // .where(`${PRICEOFF_OUTLET.NAME}.${PRICEOFF_OUTLET.COLUMNS.PRICEOFF_ID}`, offers.id)
          .where(`${PRICEOFF_PARTNER.NAME}.${PRICEOFF_PARTNER.COLUMNS.PRICEOFF_ID}`, offers.pid);


        return { ...offers, outlets_lines, partner_lines };
      })
    );


    return {
      data: responsewith_outletdetails,
      meta: response.meta
    };
  }

  async function postOfferMaster({ params, body, logTrace, userDetails }) {
    const knex = this;
    //console.log("outlet",body.outlet)
    if (Array.isArray(body.outlet) && body.outlet.length > 0) {
      console.log("outlet_check", body.outlet)
      const query = knex(PRICEOFF.NAME)
        .join(
          PRICEOFF_OUTLET.NAME,
          `${PRICEOFF_OUTLET.NAME}.${PRICEOFF_OUTLET.COLUMNS.PRICEOFF_ID}`,
          `${PRICEOFF.NAME}.${PRICEOFF.COLUMNS.PID}`
        )
        .where(`${PRICEOFF.NAME}.${PRICEOFF.COLUMNS.PROD_CODE}`, body.prod_code)
        .whereIn(`${PRICEOFF_OUTLET.NAME}.${PRICEOFF_OUTLET.COLUMNS.OUTLET_ID}`, body.outlet)
        .where(`${PRICEOFF.NAME}.${PRICEOFF.COLUMNS.PACTIVE}`, 1)
        .where(`${PRICEOFF_OUTLET.NAME}.${PRICEOFF_OUTLET.COLUMNS.IS_ACTIVE}`, true)
        .andWhere((builder) => {
          builder
            .whereBetween(`${PRICEOFF.COLUMNS.PFROM}`, [body.pfrom, body.pto])
            .orWhereBetween(`${PRICEOFF.COLUMNS.PTO}`, [body.pfrom, body.pto])
            .orWhere((subquery) => {
              subquery
                .where(`${PRICEOFF.COLUMNS.PFROM}`, '<=', body.pfrom)
                .andWhere(`${PRICEOFF.COLUMNS.PTO}`, '>=', body.pto);
            });
        });

      logQuery({
        logger: fastify.log,
        query,
        context: "Get Priceoff outlet check query",
        logTrace
      });

      const exists_response = await query;

      console.log("exists_response", exists_response);

      if (exists_response.length > 0) {
        throw CustomError.create({
          httpCode: StatusCodes.NOT_ACCEPTABLE,
          message: "Offer already exists for the specified outlets, get products, and date range",
          property: "",
          code: "NOT_ACCEPTABLE"
        });
      }
    }



    if (Array.isArray(body.ppartner) && body.ppartner.length > 0) {
      const query = knex(PRICEOFF.NAME)
        .join(
          PRICEOFF_PARTNER.NAME,
          `${PRICEOFF_PARTNER.NAME}.${PRICEOFF_PARTNER.COLUMNS.PRICEOFF_ID}`,
          `${PRICEOFF.NAME}.${PRICEOFF.COLUMNS.PID}`
        )
        .where(`${PRICEOFF.COLUMNS.PROD_CODE}`, body.prod_code)
        .whereIn(`${PRICEOFF_PARTNER.NAME}.${PRICEOFF_PARTNER.COLUMNS.PPARTNER_ID}`, body.ppartner)
        .where(`${PRICEOFF.COLUMNS.PACTIVE}`, 1)
        .where(`${PRICEOFF_PARTNER.NAME}.${PRICEOFF_PARTNER.COLUMNS.IS_ACTIVE}`, true)
        .andWhere((builder) => {
          builder
            .whereBetween(`${PRICEOFF.COLUMNS.PFROM}`, [body.pfrom, body.pto])
            .orWhereBetween(`${PRICEOFF.COLUMNS.PTO}`, [body.pfrom, body.pto])
            .orWhere((subquery) => {
              subquery
                .where(`${PRICEOFF.COLUMNS.PFROM}`, '<=', body.pfrom)
                .andWhere(`${PRICEOFF.COLUMNS.PTO}`, '>=', body.pto);
            });
        });

      const exists_response = await query;

      if (exists_response.length > 0) {
        throw CustomError.create({
          httpCode: StatusCodes.NOT_ACCEPTABLE,
          message: "Offer already exists for this partner, product, and date range",
          property: "",
          code: "NOT_ACCEPTABLE",
        });
      }
    }


    // const query_insert = await knex(`${PRICEOFF.NAME}`)
    //   .returning(['id']) // Fixed `retrning` typo
    //   .insert({
    //     [PRICEOFF.COLUMNS.PROD_CODE]: body.prod_code,
    //     [PRICEOFF.COLUMNS.AMOUNT]: body.amount,
    //     [PRICEOFF.COLUMNS.ETYPE]: body.etype,
    //     [PRICEOFF.COLUMNS.PFROM]: body.pfrom,
    //     [PRICEOFF.COLUMNS.PTO]: body.pto,
    //     [PRICEOFF.COLUMNS.OUTLET]: Array.isArray(body.outlet) ? body.outlet.join(",") : null,
    //     [PRICEOFF.COLUMNS.PNAME]: body.pname,
    //     [PRICEOFF.COLUMNS.PPARTNER]: Array.isArray(body.ppartner) ? body.ppartner.join(",") : null,
    //     [PRICEOFF.COLUMNS.PCOMPAMT]: body.pcompamt,
    //     [PRICEOFF.COLUMNS.PLOCAMT]: body.plocamt,
    //     [PRICEOFF.COLUMNS.PACTIVE]: body.pactive,
    //     [PRICEOFF.COLUMNS.OID]: body.oid,
    //     [PRICEOFF.COLUMNS.DOWNDT]: body.downdt,
    //     [PRICEOFF.COLUMNS.STATUS]: body.status,
    //     [PRICEOFF.COLUMNS.UID]: userDetails.id,
    //     [PRICEOFF.COLUMNS.PMRP]: body.pmrp,
    //     [PRICEOFF.COLUMNS.COMPANY_ID]: body.company_id || 1,
    //     [PRICEOFF.COLUMNS.CREATED_BY]: userDetails.id,
    //     [PRICEOFF.COLUMNS.UPDATED_BY]: userDetails.id,
    //   });



    // // Ensure insert was successful
    // if (!query_insert || query_insert.length === 0) {
    //   throw CustomError.create({
    //     httpCode: StatusCodes.NOT_IMPLEMENTED,
    //     message: "Error while creating price offer master",
    //     property: "",
    //     code: "NOT_IMPLEMENTED"
    //   });
    // }

    // const offerId = query_insert[0].id;

    // // Insert into related tables if data is provided
    // const outletInserts = (Array.isArray(body.outlet) && body.outlet.length > 0) ?
    //   body.outlet.map(outlet_id => ({
    //     [PRICEOFF_OUTLET.COLUMNS.PRICEOFF_ID]: offerId,
    //     [PRICEOFF_OUTLET.COLUMNS.OUTLET_ID]: outlet_id,
    //     [PRICEOFF_OUTLET.COLUMNS.IS_ACTIVE]: true,
    //     [PRICEOFF_OUTLET.COLUMNS.COMPANY_ID]: body.company_id || 1,
    //     [PRICEOFF_OUTLET.COLUMNS.CREATED_BY]: userDetails.id,
    //     [PRICEOFF_OUTLET.COLUMNS.UPDATED_BY]: userDetails.id,
    //   })) : [];

    // const partnerInserts = (Array.isArray(body.ppartner) && body.ppartner.length > 0) ?
    //   body.ppartner.map(partner => ({
    //     [PRICEOFF_PARTNER.COLUMNS.PRICEOFF_ID]: offerId,
    //     [PRICEOFF_PARTNER.COLUMNS.PPARTNER_ID]: partner,
    //     [PRICEOFF_PARTNER.COLUMNS.IS_ACTIVE]: true,
    //     [PRICEOFF_PARTNER.COLUMNS.COMPANY_ID]: body.company_id || 1,
    //     [PRICEOFF_PARTNER.COLUMNS.CREATED_BY]: userDetails.id,
    //     [PRICEOFF_PARTNER.COLUMNS.UPDATED_BY]: userDetails.id,
    //   })) : [];

    // await Promise.all([
    //   outletInserts.length > 0 && knex(PRICEOFF_OUTLET.NAME).insert(outletInserts),
    //   partnerInserts.length > 0 && knex(PRICEOFF_PARTNER.NAME).insert(partnerInserts)
    // ]);

    // // Insert log entry
    // await knex(PRICEOFF_LOGS.NAME).insert({
    //   [PRICEOFF_LOGS.COLUMNS.OPERATION_NAME]: "CREATE",
    //   [PRICEOFF_LOGS.COLUMNS.PRICEOFF_ID]: offerId,
    //   [PRICEOFF_LOGS.COLUMNS.CHANGED_DATA]: body, //JsonB
    //   [PRICEOFF_LOGS.COLUMNS.COMPANY_ID]: body.company_id || 1,
    //   [PRICEOFF_LOGS.COLUMNS.USER_NAME]: userDetails.user_name,
    //   [PRICEOFF_LOGS.COLUMNS.USER_ID]: userDetails.id,
    // });

    // Get max(pid) before inserting
    const pidResult = await knex(PRICEOFF.NAME)
      .max(`${PRICEOFF.COLUMNS.PID} as maxPid`)
      .first();

    const nextPid = (pidResult?.maxPid || 0) + 1;
    const outlets = Array.isArray(body.outlet) && body.outlet.length > 0 ? body.outlet : [null];

    for (const outlet of outlets) {
      // Insert into PRICEOFF
      const query_insert = await knex(PRICEOFF.NAME)
        .returning(['id'])
        .insert({
          [PRICEOFF.COLUMNS.PID]: nextPid,
          [PRICEOFF.COLUMNS.PROD_CODE]: body.prod_code,
          [PRICEOFF.COLUMNS.AMOUNT]: body.amount,
          [PRICEOFF.COLUMNS.ETYPE]: body.etype,
          [PRICEOFF.COLUMNS.PFROM]: body.pfrom,
          [PRICEOFF.COLUMNS.PTO]: body.pto,
          [PRICEOFF.COLUMNS.OUTLET]: outlet ?? null,
          [PRICEOFF.COLUMNS.PNAME]: body.pname,
          [PRICEOFF.COLUMNS.PPARTNER]: Array.isArray(body.ppartner) ? body.ppartner.join(",") : null,
          [PRICEOFF.COLUMNS.PCOMPAMT]: body.pcompamt,
          [PRICEOFF.COLUMNS.PLOCAMT]: body.plocamt,
          [PRICEOFF.COLUMNS.PACTIVE]: body.pactive,
          [PRICEOFF.COLUMNS.OID]: outlet ?? null,
          [PRICEOFF.COLUMNS.DOWNDT]: body.downdt,
          // [PRICEOFF.COLUMNS.STATUS]: body.status,
          [PRICEOFF.COLUMNS.UID]: userDetails.id,
          [PRICEOFF.COLUMNS.PMRP]: body.pmrp,
          [PRICEOFF.COLUMNS.COMPANY_ID]: body.company_id || 1,
          [PRICEOFF.COLUMNS.CREATED_BY]: userDetails.id,
          [PRICEOFF.COLUMNS.UPDATED_BY]: userDetails.id,
        });

      const offerId = query_insert[0].id;

      // // Insert into PRICEOFF_OUTLET (for this specific outlet)
      // const outletInsert = outlet ? {
      //   [PRICEOFF_OUTLET.COLUMNS.PRICEOFF_ID]: offerId,
      //   [PRICEOFF_OUTLET.COLUMNS.OUTLET_ID]: outlet,
      //   [PRICEOFF_OUTLET.COLUMNS.IS_ACTIVE]: true,
      //   [PRICEOFF_OUTLET.COLUMNS.COMPANY_ID]: body.company_id || 1,
      //   [PRICEOFF_OUTLET.COLUMNS.CREATED_BY]: userDetails.id,
      //   [PRICEOFF_OUTLET.COLUMNS.UPDATED_BY]: userDetails.id,
      // } : null;

      // // Insert into PRICEOFF_PARTNER (partners are same for all outlets)
      // const partnerInserts = (Array.isArray(body.ppartner) && body.ppartner.length > 0)
      //   ? body.ppartner.map(partner => ({
      //     [PRICEOFF_PARTNER.COLUMNS.PRICEOFF_ID]: offerId,
      //     [PRICEOFF_PARTNER.COLUMNS.PPARTNER_ID]: partner,
      //     [PRICEOFF_PARTNER.COLUMNS.IS_ACTIVE]: true,
      //     [PRICEOFF_PARTNER.COLUMNS.COMPANY_ID]: body.company_id || 1,
      //     [PRICEOFF_PARTNER.COLUMNS.CREATED_BY]: userDetails.id,
      //     [PRICEOFF_PARTNER.COLUMNS.UPDATED_BY]: userDetails.id,
      //   }))
      //   : [];

      // await Promise.all([
      //   outletInsert && knex(PRICEOFF_OUTLET.NAME).insert(outletInsert),
      //   partnerInserts.length > 0 && knex(PRICEOFF_PARTNER.NAME).insert(partnerInserts)
      // ]);

      // Insert log entry
      await knex(PRICEOFF_LOGS.NAME).insert({
        [PRICEOFF_LOGS.COLUMNS.OPERATION_NAME]: "CREATE",
        [PRICEOFF_LOGS.COLUMNS.PRICEOFF_ID]: offerId,
        [PRICEOFF_LOGS.COLUMNS.CHANGED_DATA]: body, // store request JSON
        [PRICEOFF_LOGS.COLUMNS.COMPANY_ID]: body.company_id || 1,
        [PRICEOFF_LOGS.COLUMNS.USER_NAME]: userDetails.user_name,
        [PRICEOFF_LOGS.COLUMNS.USER_ID]: userDetails.id,
      });
    }
    // Insert into related tables if data is provided
    const outletInserts = (Array.isArray(body.outlet) && body.outlet.length > 0) ?
      body.outlet.map(outlet_id => ({
        [PRICEOFF_OUTLET.COLUMNS.PRICEOFF_ID]: nextPid,
        [PRICEOFF_OUTLET.COLUMNS.OUTLET_ID]: outlet_id,
        [PRICEOFF_OUTLET.COLUMNS.IS_ACTIVE]: true,
        [PRICEOFF_OUTLET.COLUMNS.COMPANY_ID]: body.company_id || 1,
        [PRICEOFF_OUTLET.COLUMNS.CREATED_BY]: userDetails.id,
        [PRICEOFF_OUTLET.COLUMNS.UPDATED_BY]: userDetails.id,
      })) : [];

    const partnerInserts = (Array.isArray(body.ppartner) && body.ppartner.length > 0) ?
      body.ppartner.map(partner => ({
        [PRICEOFF_PARTNER.COLUMNS.PRICEOFF_ID]: nextPid,
        [PRICEOFF_PARTNER.COLUMNS.PPARTNER_ID]: partner,
        [PRICEOFF_PARTNER.COLUMNS.IS_ACTIVE]: true,
        [PRICEOFF_PARTNER.COLUMNS.COMPANY_ID]: body.company_id || 1,
        [PRICEOFF_PARTNER.COLUMNS.CREATED_BY]: userDetails.id,
        [PRICEOFF_PARTNER.COLUMNS.UPDATED_BY]: userDetails.id,
      })) : [];

    await Promise.all([
      outletInserts.length > 0 && knex(PRICEOFF_OUTLET.NAME).insert(outletInserts),
      partnerInserts.length > 0 && knex(PRICEOFF_PARTNER.NAME).insert(partnerInserts)
    ]);


    return { success: true };
  }

  async function putOfferMaster({ params, body, logTrace, userDetails }) {
    const knex = this;
    const { pid } = params;

    // Check if the offer exists
    const existingOffer = await knex(PRICEOFF.NAME)
      .where(PRICEOFF.COLUMNS.PID, pid)
      // .where(PRICEOFF.COLUMNS.PACTIVE, 1)
      .first();

    if (!existingOffer) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_FOUND,
        message: "Price Offer not found or inactive",
        property: "",
        code: "NOT_FOUND"
      });
    }

    let offerId;
    offerId = existingOffer[PRICEOFF.COLUMNS.ID];
    let priceofferId;
    priceofferId = existingOffer[PRICEOFF.COLUMNS.PID];

    // return offerId;
    // Check for conflicting offers for outlets
    if (Array.isArray(body.outlet) && body.outlet.length > 0) {
      console.log("offerId1", offerId);
      const query = knex(PRICEOFF.NAME)
        .join(
          PRICEOFF_OUTLET.NAME,
          `${PRICEOFF_OUTLET.NAME}.${PRICEOFF_OUTLET.COLUMNS.PRICEOFF_ID}`,
          `${PRICEOFF.NAME}.${PRICEOFF.COLUMNS.PID}`
        )
        .where(`${PRICEOFF.NAME}.${PRICEOFF.COLUMNS.PROD_CODE}`, body.prod_code)
        .whereIn(`${PRICEOFF_OUTLET.NAME}.${PRICEOFF_OUTLET.COLUMNS.OUTLET_ID}`, body.outlet)
        .where(`${PRICEOFF.NAME}.${PRICEOFF.COLUMNS.PACTIVE}`, 1)
        .where(`${PRICEOFF_OUTLET.NAME}.${PRICEOFF_OUTLET.COLUMNS.IS_ACTIVE}`, true)
        .whereNot(`${PRICEOFF.NAME}.${PRICEOFF.COLUMNS.ID}`, offerId)
        .andWhere((builder) => {
          builder
            .whereBetween(`${PRICEOFF.COLUMNS.PFROM}`, [body.pfrom, body.pto])
            .orWhereBetween(`${PRICEOFF.COLUMNS.PTO}`, [body.pfrom, body.pto])
            .orWhere((subquery) => {
              subquery
                .where(`${PRICEOFF.COLUMNS.PFROM}`, '<=', body.pfrom)
                .andWhere(`${PRICEOFF.COLUMNS.PTO}`, '>=', body.pto);
            });
        });

      const exists_response = await query;

      if (exists_response.length > 0) {
        throw CustomError.create({
          httpCode: StatusCodes.NOT_ACCEPTABLE,
          message: "Offer already exists for the specified outlets, product, and date range",
          property: "",
          code: "NOT_ACCEPTABLE"
        });
      }
    }

    // Check for conflicting offers for partners
    if (Array.isArray(body.ppartner) && body.ppartner.length > 0) {
      const query = knex(PRICEOFF.NAME)
        .join(
          PRICEOFF_PARTNER.NAME,
          `${PRICEOFF_PARTNER.NAME}.${PRICEOFF_PARTNER.COLUMNS.PRICEOFF_ID}`,
          `${PRICEOFF.NAME}.${PRICEOFF.COLUMNS.PID}`
        )
        .where(`${PRICEOFF.COLUMNS.PROD_CODE}`, body.prod_code)
        .whereIn(`${PRICEOFF_PARTNER.NAME}.${PRICEOFF_PARTNER.COLUMNS.PPARTNER_ID}`, body.ppartner)
        .where(`${PRICEOFF.COLUMNS.PACTIVE}`, 1)
        .where(`${PRICEOFF_PARTNER.COLUMNS.IS_ACTIVE}`, true)
        .whereNot(`${PRICEOFF.NAME}.${PRICEOFF.COLUMNS.ID}`, offerId)
        .andWhere((builder) => {
          builder
            .whereBetween(`${PRICEOFF.COLUMNS.PFROM}`, [body.pfrom, body.pto])
            .orWhereBetween(`${PRICEOFF.COLUMNS.PTO}`, [body.pfrom, body.pto])
            .orWhere((subquery) => {
              subquery
                .where(`${PRICEOFF.COLUMNS.PFROM}`, '<=', body.pfrom)
                .andWhere(`${PRICEOFF.COLUMNS.PTO}`, '>=', body.pto);
            });
        });

      const exists_response = await query;

      if (exists_response.length > 0) {
        throw CustomError.create({
          httpCode: StatusCodes.NOT_ACCEPTABLE,
          message: "Offer already exists for this partner, product, and date range",
          property: "",
          code: "NOT_ACCEPTABLE",
        });
      }
    }

    // // Update the offer
    // const query_update = knex(`${PRICEOFF.NAME}`)
    //   .where(`${PRICEOFF.COLUMNS.ID}`, id)
    //   .update({
    //     [PRICEOFF.COLUMNS.PROD_CODE]: body.prod_code,
    //     [PRICEOFF.COLUMNS.AMOUNT]: body.amount,
    //     [PRICEOFF.COLUMNS.ETYPE]: body.etype,
    //     [PRICEOFF.COLUMNS.PFROM]: body.pfrom,
    //     [PRICEOFF.COLUMNS.PTO]: body.pto,
    //     [PRICEOFF.COLUMNS.OUTLET]: Array.isArray(body.outlet) ? body.outlet.join(",") : null,
    //     [PRICEOFF.COLUMNS.PNAME]: body.pname,
    //     [PRICEOFF.COLUMNS.PPARTNER]: Array.isArray(body.ppartner) ? body.ppartner.join(",") : null,
    //     [PRICEOFF.COLUMNS.PCOMPAMT]: body.pcompamt,
    //     [PRICEOFF.COLUMNS.PLOCAMT]: body.plocamt,
    //     [PRICEOFF.COLUMNS.PACTIVE]: body.pactive,
    //     [PRICEOFF.COLUMNS.OID]: body.oid,
    //     [PRICEOFF.COLUMNS.DOWNDT]: body.downdt,
    //     [PRICEOFF.COLUMNS.STATUS]: body.status,
    //     [PRICEOFF.COLUMNS.UID]: userDetails.id,
    //     [PRICEOFF.COLUMNS.PMRP]: body.pmrp,
    //     [PRICEOFF.COLUMNS.COMPANY_ID]: body.company_id || 1,
    //     [PRICEOFF.COLUMNS.UPDATED_BY]: userDetails.id,
    //   });
    // const query = await query_update;

    // await knex(PRICEOFF.NAME)
    //   .where(PRICEOFF.COLUMNS.ID, id)
    //   .delete();
    await knex(PRICEOFF.NAME)
      .where(PRICEOFF.COLUMNS.PID, pid)
      .delete();

    // Get max(pid) before inserting
    const pidResult = await knex(PRICEOFF.NAME)
      .max(`${PRICEOFF.COLUMNS.PID} as maxPid`)
      .first();

    const nextPid = (pidResult?.maxPid || 0) + 1;
    const outlets = Array.isArray(body.outlet) && body.outlet.length > 0 ? body.outlet : [null];

    for (const outlet of outlets) {
      // Insert into PRICEOFF
      const query_insert = await knex(PRICEOFF.NAME)
        .returning(['id'])
        .insert({
          [PRICEOFF.COLUMNS.PID]: nextPid,
          [PRICEOFF.COLUMNS.PROD_CODE]: body.prod_code,
          [PRICEOFF.COLUMNS.AMOUNT]: body.amount,
          [PRICEOFF.COLUMNS.ETYPE]: body.etype,
          [PRICEOFF.COLUMNS.PFROM]: body.pfrom,
          [PRICEOFF.COLUMNS.PTO]: body.pto,
          [PRICEOFF.COLUMNS.OUTLET]: outlet ?? null,
          [PRICEOFF.COLUMNS.PNAME]: body.pname,
          [PRICEOFF.COLUMNS.PPARTNER]: Array.isArray(body.ppartner) ? body.ppartner.join(",") : null,
          [PRICEOFF.COLUMNS.PCOMPAMT]: body.pcompamt,
          [PRICEOFF.COLUMNS.PLOCAMT]: body.plocamt,
          [PRICEOFF.COLUMNS.PACTIVE]: body.pactive,
          [PRICEOFF.COLUMNS.OID]: outlet ?? null,
          [PRICEOFF.COLUMNS.DOWNDT]: body.downdt,
          // [PRICEOFF.COLUMNS.STATUS]: body.status,
          [PRICEOFF.COLUMNS.UID]: userDetails.id,
          [PRICEOFF.COLUMNS.PMRP]: body.pmrp,
          [PRICEOFF.COLUMNS.COMPANY_ID]: body.company_id || 1,
          [PRICEOFF.COLUMNS.CREATED_BY]: userDetails.id,
          [PRICEOFF.COLUMNS.UPDATED_BY]: userDetails.id,
        });

      const offerId = query_insert[0].id;

      // // Insert into PRICEOFF_OUTLET (for this specific outlet)
      // const outletInsert = outlet ? {
      //   [PRICEOFF_OUTLET.COLUMNS.PRICEOFF_ID]: offerId,
      //   [PRICEOFF_OUTLET.COLUMNS.OUTLET_ID]: outlet,
      //   [PRICEOFF_OUTLET.COLUMNS.IS_ACTIVE]: true,
      //   [PRICEOFF_OUTLET.COLUMNS.COMPANY_ID]: body.company_id || 1,
      //   [PRICEOFF_OUTLET.COLUMNS.CREATED_BY]: userDetails.id,
      //   [PRICEOFF_OUTLET.COLUMNS.UPDATED_BY]: userDetails.id,
      // } : null;

      // // Insert into PRICEOFF_PARTNER (partners are same for all outlets)
      // const partnerInserts = (Array.isArray(body.ppartner) && body.ppartner.length > 0)
      //   ? body.ppartner.map(partner => ({
      //     [PRICEOFF_PARTNER.COLUMNS.PRICEOFF_ID]: offerId,
      //     [PRICEOFF_PARTNER.COLUMNS.PPARTNER_ID]: partner,
      //     [PRICEOFF_PARTNER.COLUMNS.IS_ACTIVE]: true,
      //     [PRICEOFF_PARTNER.COLUMNS.COMPANY_ID]: body.company_id || 1,
      //     [PRICEOFF_PARTNER.COLUMNS.CREATED_BY]: userDetails.id,
      //     [PRICEOFF_PARTNER.COLUMNS.UPDATED_BY]: userDetails.id,
      //   }))
      //   : [];

      // await Promise.all([
      //   outletInsert && knex(PRICEOFF_OUTLET.NAME).insert(outletInsert),
      //   partnerInserts.length > 0 && knex(PRICEOFF_PARTNER.NAME).insert(partnerInserts)
      // ]);

      // Insert log entry
      await knex(PRICEOFF_LOGS.NAME).insert({
        [PRICEOFF_LOGS.COLUMNS.OPERATION_NAME]: "UPDATE",
        [PRICEOFF_LOGS.COLUMNS.PRICEOFF_ID]: offerId,
        [PRICEOFF_LOGS.COLUMNS.OLD_DATA]: existingOffer,
        [PRICEOFF_LOGS.COLUMNS.CHANGED_DATA]: body, //JsonB
        [PRICEOFF_LOGS.COLUMNS.COMPANY_ID]: body.company_id || 1,
        [PRICEOFF_LOGS.COLUMNS.USER_NAME]: userDetails.user_name,
        [PRICEOFF_LOGS.COLUMNS.USER_ID]: userDetails.id,
      });
    }

    // logQuery({
    //   logger: fastify.log,
    //   query: query_update,
    //   context: "Update Priceoff  query",
    //   logTrace
    // });

    // Handle outlet updates
    if (Array.isArray(body.outlet) && body.outlet.length > 0) {
      await knex(PRICEOFF_OUTLET.NAME)
        .where(PRICEOFF_OUTLET.COLUMNS.PRICEOFF_ID, priceofferId)
        .delete();

      const outletInserts = body.outlet.map(outlet => ({
        [PRICEOFF_OUTLET.COLUMNS.PRICEOFF_ID]: priceofferId,
        [PRICEOFF_OUTLET.COLUMNS.OUTLET_ID]: outlet,
        [PRICEOFF_OUTLET.COLUMNS.IS_ACTIVE]: true,
        [PRICEOFF_OUTLET.COLUMNS.COMPANY_ID]: body.company_id ?? 1,
        [PRICEOFF_OUTLET.COLUMNS.CREATED_BY]: userDetails.id,
        [PRICEOFF_OUTLET.COLUMNS.UPDATED_BY]: userDetails.id,
      }));

      if (outletInserts.length > 0) {
        await knex(PRICEOFF_OUTLET.NAME).insert(outletInserts);
      }
    }
    // Handle partner updates
    if (Array.isArray(body.ppartner) && body.ppartner.length > 0) {
      await knex(PRICEOFF_PARTNER.NAME)
        .where(PRICEOFF_PARTNER.COLUMNS.PRICEOFF_ID, priceofferId)
        .delete();

      const partnerInserts = body.ppartner.map(ppartner => ({
        [PRICEOFF_PARTNER.COLUMNS.PRICEOFF_ID]: priceofferId,
        [PRICEOFF_PARTNER.COLUMNS.PPARTNER_ID]: ppartner,
        [PRICEOFF_PARTNER.COLUMNS.IS_ACTIVE]: true,
        [PRICEOFF_PARTNER.COLUMNS.COMPANY_ID]: body.company_id ?? 1,
        [PRICEOFF_PARTNER.COLUMNS.CREATED_BY]: userDetails.id,
        [PRICEOFF_PARTNER.COLUMNS.UPDATED_BY]: userDetails.id,
      }));

      if (partnerInserts.length > 0) {
        await knex(PRICEOFF_PARTNER.NAME).insert(partnerInserts);
      }
    }




    // // Insert log entry
    // await knex(PRICEOFF_LOGS.NAME).insert({
    //   [PRICEOFF_LOGS.COLUMNS.OPERATION_NAME]: "UPDATE",
    //   [PRICEOFF_LOGS.COLUMNS.PRICEOFF_ID]: id,
    //   [PRICEOFF_LOGS.COLUMNS.OLD_DATA]: existingOffer,
    //   [PRICEOFF_LOGS.COLUMNS.CHANGED_DATA]: body, //JsonB
    //   [PRICEOFF_LOGS.COLUMNS.COMPANY_ID]: body.company_id || 1,
    //   [PRICEOFF_LOGS.COLUMNS.USER_NAME]: userDetails.user_name,
    //   [PRICEOFF_LOGS.COLUMNS.USER_ID]: userDetails.id,
    // });

    return { success: true };
  }



  async function deleteOfferMaster({ id, body, logTrace, userDetails }) {
    const knex = this;
    const query = knex(PRICEOFF.NAME).where(PRICEOFF.COLUMNS.ID, id);

    const exists_response = await query;

    if (!exists_response.length > 0) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_ACCEPTABLE,
        message: "OFFER_MASTER not found to delete",
        property: "",
        code: "NOT_ACCEPTABLE"
      });
    }

    // const query1 = knex(ITEM.NAME).where(
    //   ITEM.COLUMNS.UOM_ID,
    //   unit_id
    // );

    // const exists_response1 = await query1;

    // if (exists_response1.length > 0) {
    //   throw CustomError.create({
    //     httpCode: StatusCodes.NOT_ACCEPTABLE,
    //     message: "Unit is mapped with a product and cannot be deleted",
    //     property: "",
    //     code: "NOT_ACCEPTABLE"
    //   });
    // }

    const query_delete = knex(PRICEOFF.NAME)
      .where(PRICEOFF.COLUMNS.ID, id)
      .del();
    logQuery({
      logger: fastify.log,
      query: query_delete,
      context: "delete Price Offer",
      logTrace
    });
    const response = await query_delete;
    const query_delete1 = knex(PRICEOFF_OUTLET.NAME)
      .where(PRICEOFF_OUTLET.COLUMNS.PRICEOFF_ID, id)
      .del();
    logQuery({
      logger: fastify.log,
      query: query_delete1,
      context: "delete PRICEOFF_OUTLET",
      logTrace
    });
    const response1 = await query_delete1;
    const query_delete2 = knex(PRICEOFF_PARTNER.NAME)
      .where(PRICEOFF_PARTNER.COLUMNS.PRICEOFF_ID, id)
      .del();
    logQuery({
      logger: fastify.log,
      query: query_delete2,
      context: "delete PRICEOFF_PARTNER",
      logTrace
    });
    const response2 = await query_delete2;


    // Insert log entry
    await knex(PRICEOFF_LOGS.NAME).insert({
      [PRICEOFF_LOGS.COLUMNS.OPERATION_NAME]: "DELETE",
      [PRICEOFF_LOGS.COLUMNS.PRICEOFF_ID]: id,
      [PRICEOFF_LOGS.COLUMNS.CHANGED_DATA]: exists_response[0], //JsonB 
      [PRICEOFF_LOGS.COLUMNS.COMPANY_ID]: exists_response[0]?.company_id
        ? String(exists_response[0].company_id).trim()
        : null,
      [PRICEOFF_LOGS.COLUMNS.USER_NAME]: userDetails.user_name,
      [PRICEOFF_LOGS.COLUMNS.USER_ID]: userDetails.id,
    });
    return { success: true };
  }
  async function getOfferMasterInfo({ params, logTrace }) {
    const knex = this;

    const query = knex
      .select([
        `${PRICEOFF.NAME}.*`,
        `${ITEM.NAME}.pro_name as product_name`, //  product name 
      ])
      .from(`${PRICEOFF.NAME}`)
      .leftJoin(
        `${ITEM.NAME}`,
        `${ITEM.NAME}.${ITEM.COLUMNS.PRODUCT_CODE}`,
        `${PRICEOFF.NAME}.${PRICEOFF.COLUMNS.PROD_CODE}`
      )
      .where(`${PRICEOFF.NAME}.${PRICEOFF.COLUMNS.ID}`, params.id);

    logQuery({
      logger: fastify.log,
      query,
      context: "Get Price Offer Master",
      logTrace
    });
    const response = await query;

    if (!response.length) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_FOUND,
        message: "Price Offer  data not found",
        property: "",
        code: "NOT_FOUND"
      });
    }


    const responsewith_outletdetails = await Promise.all(
      response.map(async offers => {
        const outlets_lines = await knex
          .select([
            `${OUTLETS.NAME}.*`,
          ])
          .from(`${PRICEOFF_OUTLET.NAME} as ${PRICEOFF_OUTLET.NAME}`)
          .leftJoin(
            `${OUTLETS.NAME} as ${OUTLETS.NAME}`,
            `${PRICEOFF_OUTLET.NAME}.${PRICEOFF_OUTLET.COLUMNS.OUTLET_ID}`,
            `${OUTLETS.NAME}.${OUTLETS.COLUMNS.ID}`
          )
          // .where(`${PRICEOFF_OUTLET.NAME}.${PRICEOFF_OUTLET.COLUMNS.PRICEOFF_ID}`, offers.id)
          .where(`${PRICEOFF_OUTLET.NAME}.${PRICEOFF_OUTLET.COLUMNS.PRICEOFF_ID}`, offers.pid);
        const partner_lines = await knex
          .select([
            `${PRICEOFF_PARTNER.NAME}.*`,
          ])
          .from(`${PRICEOFF_PARTNER.NAME} as ${PRICEOFF_PARTNER.NAME}`)
          // .where(`${PRICEOFF_OUTLET.NAME}.${PRICEOFF_OUTLET.COLUMNS.PRICEOFF_ID}`, offers.id)
          .where(`${PRICEOFF_PARTNER.NAME}.${PRICEOFF_PARTNER.COLUMNS.PRICEOFF_ID}`, offers.pid);

        return { ...offers, outlets_lines, partner_lines };
      })
    );


    return responsewith_outletdetails[0];
  }
  async function postPriceOffExcel({ params, body, logTrace, userDetails }) {
    const knex = this;

    const successfulInserts = [];
    const failedInserts = [];

    // body will now be an array of inputs
    for (let i = 0; i < body.length; i++) {
      const priceOff = body[i];
      try {
        // --- Duplicate check for outlets ---
        if (Array.isArray(priceOff.outlet) && priceOff.outlet.length > 0) {
          const query = knex(PRICEOFF.NAME)
            .join(
              PRICEOFF_OUTLET.NAME,
              `${PRICEOFF_OUTLET.NAME}.${PRICEOFF_OUTLET.COLUMNS.PRICEOFF_ID}`,
              `${PRICEOFF.NAME}.${PRICEOFF.COLUMNS.ID}`
            )
            .where(`${PRICEOFF.NAME}.${PRICEOFF.COLUMNS.PROD_CODE}`, priceOff.prod_code)
            .whereIn(`${PRICEOFF_OUTLET.NAME}.${PRICEOFF_OUTLET.COLUMNS.OUTLET_ID}`, priceOff.outlet)
            .where(`${PRICEOFF.NAME}.${PRICEOFF.COLUMNS.PACTIVE}`, 1)
            .where(`${PRICEOFF_OUTLET.NAME}.${PRICEOFF_OUTLET.COLUMNS.IS_ACTIVE}`, true)
            .andWhere((builder) => {
              builder
                .whereBetween(`${PRICEOFF.COLUMNS.PFROM}`, [priceOff.pfrom, priceOff.pto])
                .orWhereBetween(`${PRICEOFF.COLUMNS.PTO}`, [priceOff.pfrom, priceOff.pto])
                .orWhere((subquery) => {
                  subquery
                    .where(`${PRICEOFF.COLUMNS.PFROM}`, "<=", priceOff.pfrom)
                    .andWhere(`${PRICEOFF.COLUMNS.PTO}`, ">=", priceOff.pto);
                });
            });

          const exists_response = await query;

          if (exists_response.length > 0) {
            throw CustomError.create({
              httpCode: StatusCodes.NOT_ACCEPTABLE,
              message: "Offer already exists for the specified outlets and date range",
              property: "",
              code: "NOT_ACCEPTABLE",
            });
          }
        }

        // --- Duplicate check for partners ---
        if (Array.isArray(priceOff.ppartner) && priceOff.ppartner.length > 0) {
          const query = knex(PRICEOFF.NAME)
            .join(
              PRICEOFF_PARTNER.NAME,
              `${PRICEOFF_PARTNER.NAME}.${PRICEOFF_PARTNER.COLUMNS.PRICEOFF_ID}`,
              `${PRICEOFF.NAME}.${PRICEOFF.COLUMNS.ID}`
            )
            .where(`${PRICEOFF.COLUMNS.PROD_CODE}`, priceOff.prod_code)
            .whereIn(
              `${PRICEOFF_PARTNER.NAME}.${PRICEOFF_PARTNER.COLUMNS.PPARTNER_ID}`,
              priceOff.ppartner
            )
            .where(`${PRICEOFF.COLUMNS.PACTIVE}`, 1)
            .where(`${PRICEOFF_PARTNER.NAME}.${PRICEOFF_PARTNER.COLUMNS.IS_ACTIVE}`, true)
            .andWhere((builder) => {
              builder
                .whereBetween(`${PRICEOFF.COLUMNS.PFROM}`, [priceOff.pfrom, priceOff.pto])
                .orWhereBetween(`${PRICEOFF.COLUMNS.PTO}`, [priceOff.pfrom, priceOff.pto])
                .orWhere((subquery) => {
                  subquery
                    .where(`${PRICEOFF.COLUMNS.PFROM}`, "<=", priceOff.pfrom)
                    .andWhere(`${PRICEOFF.COLUMNS.PTO}`, ">=", priceOff.pto);
                });
            });

          const exists_response = await query;

          if (exists_response.length > 0) {
            throw CustomError.create({
              httpCode: StatusCodes.NOT_ACCEPTABLE,
              message: "Offer already exists for this partner, product, and date range",
              property: "",
              code: "NOT_ACCEPTABLE",
            });
          }
        }

        // --- Get max(pid) ---
        const pidResult = await knex(PRICEOFF.NAME)
          .max(`${PRICEOFF.COLUMNS.PID} as maxPid`)
          .first();

        const nextPid = (pidResult?.maxPid || 0) + 1;
        const outlets =
          Array.isArray(priceOff.outlet) && priceOff.outlet.length > 0
            ? priceOff.outlet
            : [null];

        for (const outlet of outlets) {
          // Insert into PRICEOFF
          const query_insert = await knex(PRICEOFF.NAME)
            .returning(["id"])
            .insert({
              [PRICEOFF.COLUMNS.PID]: nextPid,
              [PRICEOFF.COLUMNS.PROD_CODE]: priceOff.prod_code,
              [PRICEOFF.COLUMNS.AMOUNT]: priceOff.amount,
              [PRICEOFF.COLUMNS.ETYPE]: priceOff.etype,
              [PRICEOFF.COLUMNS.PFROM]: priceOff.pfrom,
              [PRICEOFF.COLUMNS.PTO]: priceOff.pto,
              [PRICEOFF.COLUMNS.OUTLET]: outlet ?? null,
              [PRICEOFF.COLUMNS.PNAME]: priceOff.pname,
              [PRICEOFF.COLUMNS.PPARTNER]: Array.isArray(priceOff.ppartner)
                ? priceOff.ppartner.join(",")
                : null,
              [PRICEOFF.COLUMNS.PCOMPAMT]: priceOff.pcompamt,
              [PRICEOFF.COLUMNS.PLOCAMT]: priceOff.plocamt,
              [PRICEOFF.COLUMNS.PACTIVE]: priceOff.pactive,
              [PRICEOFF.COLUMNS.OID]: outlet ?? null,
              [PRICEOFF.COLUMNS.DOWNDT]: priceOff.downdt,
              // [PRICEOFF.COLUMNS.STATUS]: priceOff.status,
              [PRICEOFF.COLUMNS.UID]: userDetails.id,
              [PRICEOFF.COLUMNS.PMRP]: priceOff.pmrp,
              [PRICEOFF.COLUMNS.COMPANY_ID]: priceOff.company_id || 1,
              [PRICEOFF.COLUMNS.CREATED_BY]: userDetails.id,
              [PRICEOFF.COLUMNS.UPDATED_BY]: userDetails.id,
            });

          const offerId = query_insert[0].id;

          // Insert log entry
          await knex(PRICEOFF_LOGS.NAME).insert({
            [PRICEOFF_LOGS.COLUMNS.OPERATION_NAME]: "CREATE",
            [PRICEOFF_LOGS.COLUMNS.PRICEOFF_ID]: offerId,
            [PRICEOFF_LOGS.COLUMNS.CHANGED_DATA]: priceOff,
            [PRICEOFF_LOGS.COLUMNS.COMPANY_ID]: priceOff.company_id || 1,
            [PRICEOFF_LOGS.COLUMNS.USER_NAME]: userDetails.user_name,
            [PRICEOFF_LOGS.COLUMNS.USER_ID]: userDetails.id,
          });
        }

        // --- Related tables ---
        const outletInserts =
          Array.isArray(priceOff.outlet) && priceOff.outlet.length > 0
            ? priceOff.outlet.map((outlet_id) => ({
              [PRICEOFF_OUTLET.COLUMNS.PRICEOFF_ID]: nextPid,
              [PRICEOFF_OUTLET.COLUMNS.OUTLET_ID]: outlet_id,
              [PRICEOFF_OUTLET.COLUMNS.IS_ACTIVE]: true,
              [PRICEOFF_OUTLET.COLUMNS.COMPANY_ID]: priceOff.company_id || 1,
              [PRICEOFF_OUTLET.COLUMNS.CREATED_BY]: userDetails.id,
              [PRICEOFF_OUTLET.COLUMNS.UPDATED_BY]: userDetails.id,
            }))
            : [];

        const partnerInserts =
          Array.isArray(priceOff.ppartner) && priceOff.ppartner.length > 0
            ? priceOff.ppartner.map((partner) => ({
              [PRICEOFF_PARTNER.COLUMNS.PRICEOFF_ID]: nextPid,
              [PRICEOFF_PARTNER.COLUMNS.PPARTNER_ID]: partner,
              [PRICEOFF_PARTNER.COLUMNS.IS_ACTIVE]: true,
              [PRICEOFF_PARTNER.COLUMNS.COMPANY_ID]: priceOff.company_id || 1,
              [PRICEOFF_PARTNER.COLUMNS.CREATED_BY]: userDetails.id,
              [PRICEOFF_PARTNER.COLUMNS.UPDATED_BY]: userDetails.id,
            }))
            : [];

        await Promise.all([
          outletInserts.length > 0 &&
          knex(PRICEOFF_OUTLET.NAME).insert(outletInserts),
          partnerInserts.length > 0 &&
          knex(PRICEOFF_PARTNER.NAME).insert(partnerInserts),
        ]);

        successfulInserts.push({ index: i, prod_code: priceOff.prod_code });
      } catch (err) {
        failedInserts.push({
          index: i,
          reason: err.message || "Unknown error",
          payload: priceOff,
        });
      }
    }

    // return {
    //   success: failedInserts.length === 0,
    //   insertedCount: successfulInserts.length,
    //   failedCount: failedInserts.length,
    //   failedInserts,
    // };
    return {
      success: true,
      failedInserts,
    };
  }

  return {
    postOfferMaster,
    putOfferMaster,
    deleteOfferMaster,
    getOfferMasterInfo,
    getOfferMasterPaginate,
    postPriceOffExcel
  };
}

module.exports = OfferMasterRepo;
