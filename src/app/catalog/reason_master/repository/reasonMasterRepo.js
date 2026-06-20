const { StatusCodes } = require("http-status-codes");
const { CustomError } = require("../../../errorHandler");
const { logQuery } = require("../../../commons/helpers");
const { REASON_MASTER, OUTLETS, REGION, REASON_MASTER_LOGS } = require("../commons/constants");

function reasonMasterRepo(fastify) {

  // 1. CREATE
  async function postReasonMaster({ body, userDetails, logTrace }) {
    const knex = this;

    //check given outlet ids are valid
    if (body.outlet_ids && body.outlet_ids.length) {

      const outlets = await knex(OUTLETS.NAME)
        .whereIn(OUTLETS.COLUMNS.ID, body.outlet_ids)
        .andWhere(OUTLETS.COLUMNS.IS_ACTIVE, true)
        .select(OUTLETS.COLUMNS.ID);

      const validOutletIds = outlets.map(o => o[OUTLETS.COLUMNS.ID]);
      const invalidOutletIds = body.outlet_ids.filter(id => !validOutletIds.includes(id));

      if (invalidOutletIds.length) {
        throw CustomError.create({
          httpCode: StatusCodes.BAD_REQUEST,
          message: `Invalid outlet_ids: ${invalidOutletIds.join(", ")}`,
          property: "outlet_ids",
          code: "INVALID_OUTLET_IDS"
        });
      }
    }

    const exists = await knex(REASON_MASTER.NAME)
      .where(REASON_MASTER.COLUMNS.REASON_NAME, "ilike", String(body.reason_name).trim())
      .andWhere(REASON_MASTER.COLUMNS.REASON, "ilike", String(body.reason).trim())
      .first();

    if (exists) {
      throw CustomError.create({
        httpCode: StatusCodes.CONFLICT,
        message: "Reason with same name and reason already exists",
        property: "reason_name",
        code: "CONFLICT"
      });
    }

    // set unique outlet ids
    const uniqueOutletIds = [...new Set(body.outlet_ids || [])];

    const query = knex(REASON_MASTER.NAME).insert({
      [REASON_MASTER.COLUMNS.REASON_NAME]: String(body.reason_name).trim(),
      [REASON_MASTER.COLUMNS.REASON]: String(body.reason).trim(),
      [REASON_MASTER.COLUMNS.REASON_TYPE]: body.reason_type || null,
      [REASON_MASTER.COLUMNS.OUTLET_IDS]: uniqueOutletIds,
      [REASON_MASTER.COLUMNS.ACTIVE]: body.active,
      [REASON_MASTER.COLUMNS.CREATED_BY]: userDetails.id,
      [REASON_MASTER.COLUMNS.UPDATED_BY]: userDetails.id,
      [REASON_MASTER.COLUMNS.CREATED_AT]: new Date(),
      [REASON_MASTER.COLUMNS.UPDATED_AT]: new Date()
    })
      .returning("*");

    logQuery({
      logger: fastify.log,
      query,
      context: "Post Reason Master",
      logTrace
    });

    const result = await query;

    if (!result) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_IMPLEMENTED,
        message: "Error while creating reason",
        property: "",
        code: "NOT_IMPLEMENTED"
      });
    }

    await knex(REASON_MASTER_LOGS.NAME).insert({
      [REASON_MASTER_LOGS.COLUMNS.OPERATION_NAME]: "CREATE",
      [REASON_MASTER_LOGS.COLUMNS.REASON_MASTER_ID]: result[0].id,
      [REASON_MASTER_LOGS.COLUMNS.OLD_DATA]: null,
      [REASON_MASTER_LOGS.COLUMNS.NEW_DATA]: body ? JSON.stringify({ reason_master: result[0] }) : null,
      [REASON_MASTER_LOGS.COLUMNS.USER_ID]: userDetails.id,
      [REASON_MASTER_LOGS.COLUMNS.USER_NAME]: userDetails.user_name
    });

    return { success: true };
  }

  // 2. GET OUTLETS BY REGION (active outlets mapped to reason_master outlet_ids)
  async function getReasonOutletsByRegion({ params, logTrace }) {
    const knex = this;

    const query = knex(OUTLETS.NAME)
      .select([
        `${OUTLETS.NAME}.${OUTLETS.COLUMNS.ID} as outlet_id`,
        `${OUTLETS.NAME}.${OUTLETS.COLUMNS.FULL_NAME} as outlet_name`,
        `${OUTLETS.NAME}.${OUTLETS.COLUMNS.BANK_ID} as store_code`,
        `${REGION.NAME}.${REGION.COLUMNS.REGION_NAME} as region`
      ])
      .innerJoin(REGION.NAME, `${OUTLETS.NAME}.${OUTLETS.COLUMNS.REGION_ID}`, `${REGION.NAME}.${REGION.COLUMNS.ID}`)
      .where(`${OUTLETS.NAME}.${OUTLETS.COLUMNS.IS_ACTIVE}`, true)
      .orderBy(`${OUTLETS.NAME}.${OUTLETS.COLUMNS.FULL_NAME}`, "asc");

    logQuery({
      logger: fastify.log,
      query: query,
      context: "Get Reason Outlets By Region",
      logTrace
    });

    const response = await query;
    if (!response.length) {
      throw CustomError.create({ httpCode: StatusCodes.NOT_FOUND, message: "No active outlets found for this region", property: "region_id", code: "NOT_FOUND" });
    }
    // region based 
    // format { bangalore:[{},{}], hyderabad:[{},{}}] }
    const grouped = response.reduce((acc, curr) => {
      const key = curr.region; // Assuming 'region' is a column in your response
      if (!acc[key]) acc[key] = [];
      acc[key].push(curr);
      return acc;
    }, {});

    const updated_res = {};

    Object.keys(grouped).forEach(region => {
      updated_res[region] = grouped[region];
    });

    return updated_res;
  }

  // 3. SEARCH / LIST with pagination
  async function getReasonMasterList({ params, query: queryString, logTrace }) {
    const knex = this;

    const { page_size, current_page } = params;
    const { search, region_id, outlet_id } = queryString;

    const regionIdNum = Number(region_id);
    const outletIdNum = Number(outlet_id);

    let query = knex(REASON_MASTER.NAME)
      .select([
        `${REASON_MASTER.NAME}.${REASON_MASTER.COLUMNS.ID} as id`,
        `${REASON_MASTER.NAME}.${REASON_MASTER.COLUMNS.REASON} as reason`,
        `${REASON_MASTER.NAME}.${REASON_MASTER.COLUMNS.REASON_NAME} as reason_name`,
        `${REASON_MASTER.NAME}.${REASON_MASTER.COLUMNS.ACTIVE} as active`,

        // full array
        // knex.raw(`${REASON_MASTER.NAME}.${REASON_MASTER.COLUMNS.OUTLET_IDS} as outlet_id`),
        `${OUTLETS.NAME}.${OUTLETS.COLUMNS.ID} as outlet_id`,
        // outlet details
        `${OUTLETS.NAME}.${OUTLETS.COLUMNS.FULL_NAME} as outlet_name`,
        `${OUTLETS.NAME}.${OUTLETS.COLUMNS.BANK_ID} as store_code`,
        `${REGION.NAME}.${REGION.COLUMNS.REGION_NAME} as region`
      ])

      // JOIN using ANY (array column)
      .joinRaw(`
      JOIN ${OUTLETS.NAME}
      ON ${OUTLETS.NAME}.${OUTLETS.COLUMNS.ID} = ANY(${REASON_MASTER.NAME}.${REASON_MASTER.COLUMNS.OUTLET_IDS})
    `)

      .innerJoin(
        REGION.NAME,
        `${OUTLETS.NAME}.${OUTLETS.COLUMNS.REGION_ID}`,
        `${REGION.NAME}.${REGION.COLUMNS.ID}`
      )
      .orderBy(`${OUTLETS.NAME}.${OUTLETS.COLUMNS.BANK_ID}`, "asc");

    //  Global search (all fields)
    if (search && search.trim()) {
      query.where(function () {
        this.where(`${REASON_MASTER.NAME}.${REASON_MASTER.COLUMNS.REASON_NAME}`, "ilike", `%${search}%`)
          .orWhere(`${REASON_MASTER.NAME}.${REASON_MASTER.COLUMNS.REASON}`, "ilike", `%${search}%`)
          .orWhere(`${OUTLETS.NAME}.${OUTLETS.COLUMNS.FULL_NAME}`, "ilike", `%${search}%`)
          .orWhereRaw(`${OUTLETS.NAME}.${OUTLETS.COLUMNS.BANK_ID}::text ILIKE ?`, [`%${search}%`]);
        const val = String(search).toLowerCase();

        if ("yes".startsWith(val)) {
          this.orWhere(`${REASON_MASTER.NAME}.${REASON_MASTER.COLUMNS.ACTIVE}`, true);
        } else if ("no".startsWith(val)) {
          this.orWhere(`${REASON_MASTER.NAME}.${REASON_MASTER.COLUMNS.ACTIVE}`, false);
        }

      });
    }

    if (Number.isInteger(regionIdNum) && regionIdNum !== -1) {
      query.where(`${REGION.NAME}.${REGION.COLUMNS.ID}`, regionIdNum);
    }

    if (Number.isInteger(regionIdNum) && regionIdNum !== -1 && Number.isInteger(outletIdNum) && outletIdNum !== -1) {
      query.where(`${OUTLETS.NAME}.${OUTLETS.COLUMNS.REGION_ID}`, regionIdNum)
        .andWhere(`${OUTLETS.NAME}.${OUTLETS.COLUMNS.ID}`, outletIdNum);
    }

    //  Logging (fixed)
    logQuery({
      logger: fastify.log,
      query,
      context: "Get Reason Master List",
      logTrace
    });

    //  Pagination AFTER filters
    const response = await query.paginate({
      pageSize: Number(page_size),
      currentPage: Number(current_page)
    });

    // page overflow
    if (response.meta.pagination.total_pages < current_page) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_ACCEPTABLE,
        message: "Requested page is beyond the available data",
        code: "NOT_ACCEPTABLE"
      });
    }

    //  No data
    if (!response.data.length) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_FOUND,
        message: "Reason not found",
        code: "NOT_FOUND"
      });
    }

    return response;
  }

  // 4. get reason master info for edit page
  async function getReasonMasterInfo({ params, body, userDetails, logTrace }) {
    const knex = this;
    const { reason_id } = params;

    const existing = await knex(REASON_MASTER.NAME).where(REASON_MASTER.COLUMNS.ID, reason_id).first();
    if (!existing) {
      throw CustomError.create({ httpCode: StatusCodes.NOT_FOUND, message: "Reason not found", property: "", code: "NOT_FOUND" });
    }

    const query = knex(REASON_MASTER.NAME)
      .select([
        `${REASON_MASTER.NAME}.${REASON_MASTER.COLUMNS.ID} as id`,
        `${REASON_MASTER.NAME}.${REASON_MASTER.COLUMNS.REASON} as reason`,
        `${REASON_MASTER.NAME}.${REASON_MASTER.COLUMNS.REASON_NAME} as reason_name`,
        `${REASON_MASTER.NAME}.${REASON_MASTER.COLUMNS.REASON_TYPE} as reason_type`,
        `${REASON_MASTER.NAME}.${REASON_MASTER.COLUMNS.ACTIVE} as active`,
        // full array
        knex.raw(`${REASON_MASTER.NAME}.${REASON_MASTER.COLUMNS.OUTLET_IDS} as outlet_ids`)
      ])
      .where(REASON_MASTER.COLUMNS.ID, reason_id);

    logQuery({
      logger: fastify.log,
      query: query,
      context: "Put Reason Master",
      logTrace
    });

    const result = await query;
    if (!result) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_IMPLEMENTED,
        message: "Error while updating reason",
        property: "",
        code: "NOT_IMPLEMENTED"
      });
    }
    return result[0];
  }

  // 4. UPDATE
  async function putReasonMaster({ params, body, userDetails, logTrace }) {
    const knex = this;
    const { reason_id } = params;

    const existing = await knex(REASON_MASTER.NAME).where(REASON_MASTER.COLUMNS.ID, reason_id).first();
    if (!existing) {
      throw CustomError.create({ httpCode: StatusCodes.NOT_FOUND, message: "Reason not found", property: "", code: "NOT_FOUND" });
    }

    if (body.length === 0) {
      throw CustomError.create({ httpCode: StatusCodes.BAD_REQUEST, message: "Request body cannot be empty", property: "", code: "BAD_REQUEST" });
    }

    //check given outlet ids are valid
    if (body.outlet_ids && body.outlet_ids.length) {

      const outlets = await knex(OUTLETS.NAME)
        .whereIn(OUTLETS.COLUMNS.ID, body.outlet_ids)
        .andWhere(OUTLETS.COLUMNS.IS_ACTIVE, true)
        .select(OUTLETS.COLUMNS.ID);

      const validOutletIds = outlets.map(o => o[OUTLETS.COLUMNS.ID]);
      const invalidOutletIds = body.outlet_ids.filter(id => !validOutletIds.includes(id));

      if (invalidOutletIds.length) {
        throw CustomError.create({
          httpCode: StatusCodes.BAD_REQUEST,
          message: `Invalid outlet_ids: ${invalidOutletIds.join(", ")}`,
          property: "outlet_ids",
          code: "INVALID_OUTLET_IDS"
        });
      }
    }

    const updateData = {
      [REASON_MASTER.COLUMNS.UPDATED_BY]: userDetails.id,
      [REASON_MASTER.COLUMNS.UPDATED_AT]: new Date()
    };

    if (body.reason_name) updateData[REASON_MASTER.COLUMNS.REASON_NAME] = String(body.reason_name).trim();
    if (body.reason) updateData[REASON_MASTER.COLUMNS.REASON] = String(body.reason).trim();
    if (body.reason_type) updateData[REASON_MASTER.COLUMNS.REASON_TYPE] = body.reason_type;
    if (body.outlet_ids) {
      // set unique outlet ids
      const uniqueOutletIds = [...new Set(body.outlet_ids || [])];
      updateData[REASON_MASTER.COLUMNS.OUTLET_IDS] = uniqueOutletIds;
    }
    if (body.active) updateData[REASON_MASTER.COLUMNS.ACTIVE] = body.active;


    if (body.reason_name || body.reason) {
      const exists = await knex(REASON_MASTER.NAME)
        .where(REASON_MASTER.COLUMNS.REASON_NAME, "ilike", String(body.reason_name).trim())
        .andWhere(REASON_MASTER.COLUMNS.REASON, "ilike", String(body.reason).trim())
        .andWhere(REASON_MASTER.COLUMNS.ID, "!=", reason_id)
        .first();

      if (exists) {
        throw CustomError.create({
          httpCode: StatusCodes.CONFLICT,
          message: "Reason with same name and reason already exists",
          property: "reason_name",
          code: "CONFLICT"
        });
      }
    }

    const query = knex(REASON_MASTER.NAME)
      .where(REASON_MASTER.COLUMNS.ID, reason_id)
      .update(updateData)
      .returning("*");

    logQuery({
      logger: fastify.log,
      query: query,
      context: "Put Reason Master",
      logTrace
    });

    const result = await query;
    if (!result) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_IMPLEMENTED,
        message: "Error while updating reason",
        property: "",
        code: "NOT_IMPLEMENTED"
      });
    }

    await knex(REASON_MASTER_LOGS.NAME).insert({
      [REASON_MASTER_LOGS.COLUMNS.OPERATION_NAME]: "UPDATE",
      [REASON_MASTER_LOGS.COLUMNS.REASON_MASTER_ID]: result[0].id,
      [REASON_MASTER_LOGS.COLUMNS.OLD_DATA]: existing ? JSON.stringify({ reason_master: existing }) : null,
      [REASON_MASTER_LOGS.COLUMNS.NEW_DATA]: body ? JSON.stringify({ body: body }) : null,
      [REASON_MASTER_LOGS.COLUMNS.USER_ID]: userDetails.id,
      [REASON_MASTER_LOGS.COLUMNS.USER_NAME]: userDetails.user_name
    });
    return { success: true };
  }

  // 5. EXPORT EXCEL
  async function exportReasonMasterExcel({ logTrace }) {
    const knex = this;

    const query = knex(REASON_MASTER.NAME)
      .select([
        `${REASON_MASTER.NAME}.${REASON_MASTER.COLUMNS.ID} as id`,
        `${REASON_MASTER.NAME}.${REASON_MASTER.COLUMNS.REASON} as reason`,
        `${REASON_MASTER.NAME}.${REASON_MASTER.COLUMNS.REASON_NAME} as reason_name`,
        `${REASON_MASTER.NAME}.${REASON_MASTER.COLUMNS.ACTIVE} as active`,
        `${OUTLETS.NAME}.${OUTLETS.COLUMNS.FULL_NAME} as outlet_name`,
        `${OUTLETS.NAME}.${OUTLETS.COLUMNS.BANK_ID} as store_code`,
        `${REGION.NAME}.${REGION.COLUMNS.REGION_NAME} as region`
      ])
      .joinRaw(`
      JOIN ${OUTLETS.NAME}
      ON ${OUTLETS.NAME}.${OUTLETS.COLUMNS.ID} = ANY(${REASON_MASTER.NAME}.${REASON_MASTER.COLUMNS.OUTLET_IDS})
    `)
      .innerJoin(
        REGION.NAME,
        `${OUTLETS.NAME}.${OUTLETS.COLUMNS.REGION_ID}`,
        `${REGION.NAME}.${REGION.COLUMNS.ID}`
      )
      .orderBy(`${OUTLETS.NAME}.${OUTLETS.COLUMNS.BANK_ID}`, "asc");

    //  Logging
    logQuery({
      logger: fastify.log,
      query,
      context: "Export Reason Master",
      logTrace
    });

    const response = await query;

    //  Format for Excel
    const formatted = response.map(r => ({
      region: r.region,
      outlet_name: r.outlet_name,
      store_code: Number(r.store_code) || "",
      reason: r.reason,
      reason_name: r.reason_name,
      active: r.active ? "YES" : "NO"
    }));

    return formatted;
  }

  return {
    postReasonMaster,
    getReasonOutletsByRegion,
    getReasonMasterList,
    getReasonMasterInfo,
    putReasonMaster,
    exportReasonMasterExcel
  };
}

module.exports = reasonMasterRepo;
