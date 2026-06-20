const { StatusCodes } = require("http-status-codes");
const { CustomError } = require("../../../errorHandler");
const { logQuery } = require("../../../commons/helpers");
const { STORE_MANAGER, STORE_MANAGER_LOGS, OUTLETS, REGION, USERS } = require("../commons/constants");
const xlsx = require("xlsx");
const excelImportRepo = require("../../../Excelupload/repository/excelRepo");
const { parse } = require("../../../errorHandler/CustomError");

function storeManagerRepo(fastify) {


  async function getStoreManagerList({ query, params, logTrace }) {
    const knex = this;
    const { search, outlet_id } = query;
    const { page_size, current_page } = params;

    const q = knex(STORE_MANAGER.NAME)
      .select([
        `${STORE_MANAGER.NAME}.*`,
        `${OUTLETS.NAME}.${OUTLETS.COLUMNS.BANK_ID} as store_code`,
        `${OUTLETS.NAME}.${OUTLETS.COLUMNS.FULL_NAME} as outlet_full_name`
      ])
      .leftJoin(OUTLETS.NAME, `${STORE_MANAGER.NAME}.${STORE_MANAGER.COLUMNS.OUTLET_ID}`, `${OUTLETS.NAME}.${OUTLETS.COLUMNS.ID}`)
      .orderBy(`${STORE_MANAGER.NAME}.${STORE_MANAGER.COLUMNS.CREATED_AT}`, "desc");

    if (search && search.length >= 3) {
      q.where(function () {
        this.where(`${STORE_MANAGER.NAME}.${STORE_MANAGER.COLUMNS.SM_NAME}`, "ilike", `%${search}%`)
          .orWhere(`${STORE_MANAGER.NAME}.${STORE_MANAGER.COLUMNS.SM_MOBILE}`, "ilike", `%${search}%`);
      });
    }

    if (outlet_id) {
      q.where(`${STORE_MANAGER.NAME}.${STORE_MANAGER.COLUMNS.OUTLET_ID}`, outlet_id);
    }

    logQuery({ logger: fastify.log, query: q, context: "Get Store Manager List", logTrace });

    const response = await q.paginate({ pageSize: page_size, currentPage: current_page });

    if (response.meta.pagination.total_pages < current_page) {
      throw CustomError.create({ httpCode: StatusCodes.NOT_ACCEPTABLE, message: "Requested page is beyond the available data", property: "", code: "NOT_ACCEPTABLE" });
    }

    if (!response.data.length) {
      throw CustomError.create({ httpCode: StatusCodes.NOT_FOUND, message: "Store managers not found", property: "", code: "NOT_FOUND" });
    }

    return response;
  }

  async function getStoreManagerInfo({ params, logTrace }) {
    const knex = this;
    const { outlet_id } = params;

    const q = knex(STORE_MANAGER.NAME)
      .select([
        `${STORE_MANAGER.NAME}.*`,
        `${OUTLETS.NAME}.${OUTLETS.COLUMNS.BANK_ID} as store_code`,
        `${OUTLETS.NAME}.${OUTLETS.COLUMNS.FULL_NAME} as outlet_full_name`
      ])
      .leftJoin(OUTLETS.NAME, `${STORE_MANAGER.NAME}.${STORE_MANAGER.COLUMNS.OUTLET_ID}`, `${OUTLETS.NAME}.${OUTLETS.COLUMNS.ID}`)
      .where(`${STORE_MANAGER.NAME}.${STORE_MANAGER.COLUMNS.OUTLET_ID}`, outlet_id)
      .first();

    logQuery({ logger: fastify.log, query: q, context: "Get Store Manager Info", logTrace });

    const response = await q;
    if (!response) {
      throw CustomError.create({ httpCode: StatusCodes.NOT_FOUND, message: "Store manager not found", property: "", code: "NOT_FOUND" });
    }
    return response;
  }

  async function postStoreManager({ body, logTrace, userDetails }) {
    const knex = this;
    const trx = await knex.transaction();
    try {

      const { sm_data = [] } = body;

      if (!Array.isArray(sm_data) || sm_data.length === 0) {
        throw CustomError.create({
          httpCode: StatusCodes.BAD_REQUEST,
          message: "sm_data must be a non-empty array",
          property: "sm_data",
          code: "VALIDATION_ERROR"
        });
      }

      const storeCodes = sm_data.map(r => r.store_code);

      // 1. Validate outlets exist
      const outlets = await knex(OUTLETS.NAME)
        .select([OUTLETS.COLUMNS.BANK_ID, OUTLETS.COLUMNS.FULL_NAME])
        .whereIn(OUTLETS.COLUMNS.BANK_ID, storeCodes)
        .where(OUTLETS.COLUMNS.IS_ACTIVE, true);

      const validCodeIds = outlets.map(o => String(o.bankid));

      const invalid = storeCodes.filter(code => !validCodeIds.includes(String(code)));

      if (invalid.length) {
        throw CustomError.create({
          httpCode: StatusCodes.NOT_FOUND,
          message: `Outlets not found: ${invalid.join(", ")}`,
          property: "store_code",
          code: "NOT_FOUND"
        });
      }

      // 2. Fetch existing store managers
      const existingRecords = await knex(STORE_MANAGER.NAME)
        .whereIn(STORE_MANAGER.COLUMNS.STORE_CODE, storeCodes);

      const existingMap = Object.fromEntries(
        existingRecords.map(r => [String(r.store_code), r])
      );


      // 2.5 Validate mobile uniqueness across store managers
      const mobiles = sm_data.map(r => r.sm_mobile);

      // fetch existing mobiles
      const existingMobiles = await knex(STORE_MANAGER.NAME)
        .whereIn(STORE_MANAGER.COLUMNS.SM_MOBILE, mobiles);

      for (const row of existingMobiles) {
        const incoming = sm_data.find(
          r => r.sm_mobile === row.sm_mobile
        );

        // allow if same store_code (update case)
        if (incoming && String(incoming.store_code) !== String(row.store_code)) {
          throw CustomError.create({
            httpCode: StatusCodes.CONFLICT,
            message: `Mobile number ${row.sm_mobile} already assigned to another store_code ${row.store_code}`,
            property: "sm_mobile",
            code: "DUPLICATE_MOBILE"
          });
        }
      }

      // 3. Transaction

      const insertRows = sm_data.map(r => ({
        [STORE_MANAGER.COLUMNS.STORE_CODE]: r.store_code,
        [STORE_MANAGER.COLUMNS.OUTLET_NAME]:
          outlets.find(o => String(o.bankid) === String(r.store_code))?.[OUTLETS.COLUMNS.FULL_NAME],
        [STORE_MANAGER.COLUMNS.SM_NAME]: r.sm_name,
        [STORE_MANAGER.COLUMNS.SM_MOBILE]: r.sm_mobile,
        [STORE_MANAGER.COLUMNS.CREATED_BY]: userDetails.id,
        [STORE_MANAGER.COLUMNS.UPDATED_BY]: userDetails.id,
        [STORE_MANAGER.COLUMNS.STATUS]: false
      }));

      //  Upsert (insert or update)
      await trx(STORE_MANAGER.NAME)
        .insert(insertRows)
        .onConflict(STORE_MANAGER.COLUMNS.STORE_CODE)
        .merge({
          [STORE_MANAGER.COLUMNS.SM_NAME]: trx.raw("EXCLUDED.sm_name"),
          [STORE_MANAGER.COLUMNS.SM_MOBILE]: trx.raw("EXCLUDED.sm_mobile"),
          [STORE_MANAGER.COLUMNS.OUTLET_NAME]: trx.raw("EXCLUDED.outlet_name"),
          [STORE_MANAGER.COLUMNS.UPDATED_BY]: trx.raw("EXCLUDED.updated_by"),
          updated_at: trx.fn.now()
        });

      // 4. Logs (only if changed)
      const logRows = sm_data
        .filter(r => {
          const old = existingMap[String(r.store_code)];
          return (
            !old ||
            old.sm_name !== r.sm_name ||
            old.sm_mobile !== r.sm_mobile
          );
        })
        .map(r => {
          const old = existingMap[String(r.store_code)];

          return {
            operation_name: old ? "UPDATE" : "CREATE",
            store_code: r.store_code,
            user_id: userDetails.id,
            user_name: userDetails.user_name,
            old_name: old?.sm_name ?? null,
            new_name: r.sm_name,
            old_mobile: old?.sm_mobile ?? null,
            new_mobile: r.sm_mobile
          };
        });

      if (logRows.length) {
        await trx(STORE_MANAGER_LOGS.NAME).insert(logRows);
      }


      await trx.commit();

      return {
        success: true
      };
    } catch (error) {
      await trx.rollback();

      throw CustomError.create({
        httpCode: error.httpCode || StatusCodes.INTERNAL_SERVER_ERROR,
        message: error.message || "Failed to save store manager",
        code: "STORE_MANAGER_SAVE_FAILED"
      });
    }
  }

  async function putStoreManager({ params, body, logTrace, userDetails }) {
    const knex = this;
    const { store_code } = params;

    if (!body.sm_mobile && !body.sm_name) {
      throw CustomError.create({
        httpCode: StatusCodes.BAD_REQUEST,
        message: "At least one of sm_mobile or sm_name is required",
        property: "sm_mobile/sm_name",
        code: "VALIDATION_ERROR"
      });
    }


    const existing = await knex(STORE_MANAGER.NAME)
      .where(STORE_MANAGER.COLUMNS.STORE_CODE, store_code)
      .first();

    //check given mobile no already exists for other store manager
    if (body.sm_mobile) {
      const mobileExists = await knex(STORE_MANAGER.NAME)
        .where(STORE_MANAGER.COLUMNS.SM_MOBILE, body.sm_mobile)
        .whereNot(STORE_MANAGER.COLUMNS.STORE_CODE, store_code)
        .first();

      if (mobileExists) {
        throw CustomError.create({
          httpCode: StatusCodes.CONFLICT,
          message: "Mobile number already exists for another store manager",
          property: "sm_mobile",
          code: "MOBILE_ALREADY_EXISTS"
        });
      }
    }

    if (!existing) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_FOUND,
        message: "Store manager not found",
        property: "",
        code: "NOT_FOUND"
      });
    }

    const updateData = {
      [STORE_MANAGER.COLUMNS.UPDATED_BY]: userDetails.id,
      [STORE_MANAGER.COLUMNS.UPDATED_AT]: knex.fn.now()
    };

    if (body.sm_name) updateData[STORE_MANAGER.COLUMNS.SM_NAME] = body.sm_name;
    if (body.sm_mobile) updateData[STORE_MANAGER.COLUMNS.SM_MOBILE] = body.sm_mobile;

    const query = knex(STORE_MANAGER.NAME).where(STORE_MANAGER.COLUMNS.STORE_CODE, store_code).update(updateData).returning("*");

    logQuery({
      logger: fastify.log,
      query: query,
      context: "Update Store Manager",
      logTrace
    });

    const response = await query;
    if (!response) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_IMPLEMENTED,
        message: "Error while updating store manager",
        property: "",
        code: "NOT_IMPLEMENTED"
      });
    }

    await knex(STORE_MANAGER_LOGS.NAME).insert({
      [STORE_MANAGER_LOGS.COLUMNS.OPERATION_NAME]: "UPDATE",
      [STORE_MANAGER_LOGS.COLUMNS.STORE_CODE]: store_code,
      [STORE_MANAGER_LOGS.COLUMNS.USER_ID]: userDetails.id,
      [STORE_MANAGER_LOGS.COLUMNS.USER_NAME]: userDetails.user_name,
      [STORE_MANAGER_LOGS.COLUMNS.OLD_NAME]: existing?.sm_name ?? null,
      [STORE_MANAGER_LOGS.COLUMNS.NEW_NAME]: body.sm_name ?? existing?.sm_name ?? null,
      [STORE_MANAGER_LOGS.COLUMNS.OLD_MOBILE]: existing?.sm_mobile ?? null,
      [STORE_MANAGER_LOGS.COLUMNS.NEW_MOBILE]: body.sm_mobile ?? existing?.sm_mobile ?? null
    });
    return { success: true };
  }

  async function swapStoreManager({ body, logTrace, userDetails }) {
    const knex = this;
    const trx = await knex.transaction();
    try {
      const { from_store_code, to_store_code } = body;

      const [fromSM, toSM] = await Promise.all([
        knex(STORE_MANAGER.NAME).where(STORE_MANAGER.COLUMNS.STORE_CODE, from_store_code).first(),
        knex(STORE_MANAGER.NAME).where(STORE_MANAGER.COLUMNS.STORE_CODE, to_store_code).first()
      ]);

      if (!fromSM) {
        throw CustomError.create({
          httpCode: StatusCodes.NOT_FOUND,
          message: "Source outlet store manager not found",
          property: "from_store_code",
          code: "NOT_FOUND"
        });
      }
      if (!toSM) {
        throw CustomError.create({
          httpCode: StatusCodes.NOT_FOUND,
          message: "Destination outlet store manager not found",
          property: "to_store_code",
          code: "NOT_FOUND"
        });
      }

      await trx(STORE_MANAGER.NAME).where(STORE_MANAGER.COLUMNS.STORE_CODE, from_store_code).update({
        [STORE_MANAGER.COLUMNS.SM_NAME]: toSM.sm_name,
        [STORE_MANAGER.COLUMNS.SM_MOBILE]: toSM.sm_mobile,
        [STORE_MANAGER.COLUMNS.UPDATED_BY]: userDetails.id,
        [STORE_MANAGER.COLUMNS.UPDATED_AT]: knex.fn.now()
      });

      await trx(STORE_MANAGER.NAME).where(STORE_MANAGER.COLUMNS.STORE_CODE, to_store_code).update({
        [STORE_MANAGER.COLUMNS.SM_NAME]: fromSM.sm_name,
        [STORE_MANAGER.COLUMNS.SM_MOBILE]: fromSM.sm_mobile,
        [STORE_MANAGER.COLUMNS.UPDATED_BY]: userDetails.id,
        [STORE_MANAGER.COLUMNS.UPDATED_AT]: knex.fn.now()
      });

      await trx(STORE_MANAGER_LOGS.NAME).insert([
        {
          [STORE_MANAGER_LOGS.COLUMNS.STORE_CODE]: from_store_code,
          [STORE_MANAGER_LOGS.COLUMNS.OPERATION_NAME]: "SWAP",
          [STORE_MANAGER_LOGS.COLUMNS.USER_ID]: userDetails.id,
          [STORE_MANAGER_LOGS.COLUMNS.USER_NAME]: userDetails.user_name,
          [STORE_MANAGER_LOGS.COLUMNS.OLD_NAME]: fromSM.sm_name,
          [STORE_MANAGER_LOGS.COLUMNS.NEW_NAME]: toSM.sm_name,
          [STORE_MANAGER_LOGS.COLUMNS.OLD_MOBILE]: fromSM.sm_mobile,
          [STORE_MANAGER_LOGS.COLUMNS.NEW_MOBILE]: toSM.sm_mobile
        },
        {
          [STORE_MANAGER_LOGS.COLUMNS.STORE_CODE]: to_store_code,
          [STORE_MANAGER_LOGS.COLUMNS.OPERATION_NAME]: "SWAP",
          [STORE_MANAGER_LOGS.COLUMNS.USER_ID]: userDetails.id,
          [STORE_MANAGER_LOGS.COLUMNS.USER_NAME]: userDetails.user_name,
          [STORE_MANAGER_LOGS.COLUMNS.OLD_NAME]: toSM.sm_name,
          [STORE_MANAGER_LOGS.COLUMNS.NEW_NAME]: fromSM.sm_name,
          [STORE_MANAGER_LOGS.COLUMNS.OLD_MOBILE]: toSM.sm_mobile,
          [STORE_MANAGER_LOGS.COLUMNS.NEW_MOBILE]: fromSM.sm_mobile
        }
      ]);

      await trx.commit();

      return { success: true };
    } catch (error) {
      await trx.rollback();

      throw CustomError.create({
        httpCode: error.httpCode || StatusCodes.INTERNAL_SERVER_ERROR,
        message: error.message || "Failed to save store manager",
        code: "STORE_MANAGER_SAVE_FAILED"
      });
    }
  }

  async function importStoreManagerExcel({ body, params, logTrace, userDetails }) {
    const knex = this;

    const { uploadExcelData } = excelImportRepo(fastify);

    // 1. Read Excel
    const excelData = await uploadExcelData.call(knex, {
      body,
      params,
      logTrace
    });

    const excelColumns = excelData.headers || [];

    // 2. Validate required columns
    const normalizedHeaders = excelColumns.map(h => h.toLowerCase().trim());

    const requiredHeaders = [
      "store code",
      "store name",
      "store manager name",
      "mobile no"
    ];

    const missingColumns = requiredHeaders.filter(
      col => !normalizedHeaders.includes(col)
    );

    if (missingColumns.length > 0) {
      throw CustomError.create({
        httpCode: StatusCodes.BAD_REQUEST,
        message: `Missing required columns: ${missingColumns.join(", ")}`,
        property: "Excel Required Columns",
        code: "EXCEL_IMPORT_FAILED"
      });
    }

    const { data = [] } = excelData;

    // 3. Normalize headers
    const HEADER_MAP = {
      "store code": "store_code",
      "store name": "outlet_name",
      "store manager name": "sm_name",
      "mobile no": "sm_mobile",
    };

    const parsed = data.map(row => {
      const normalized = {};
      for (const key of Object.keys(row)) {
        const mapped = HEADER_MAP[key.toLowerCase().trim()];
        if (mapped) normalized[mapped] = String(row[key]).trim();
      }
      return normalized;
    });

    // 4. Validate data
    const storeCodes = parsed.map(r => r.store_code);

    // duplicate detection
    const seen = new Set();
    const duplicates = new Set();

    for (const id of storeCodes) {
      if (seen.has(id)) duplicates.add(id);
      seen.add(id);
    }

    for (let i = 0; i < parsed.length; i++) {
      const r = parsed[i];

      if (!r.store_code || !r.outlet_name || !r.sm_name || !r.sm_mobile) {
        throw CustomError.create({
          httpCode: StatusCodes.BAD_REQUEST,
          message: "Missing required fields (store_code, outlet_name, sm_name, sm_mobile) row-" + (i + 2),
          property: "excelfile",
          code: "VALIDATION_ERROR"
        });

      }

      if (duplicates.has(r.store_code)) {
        throw CustomError.create({
          httpCode: StatusCodes.BAD_REQUEST,
          message: `Duplicate store_code ${r.store_code} in file row ${(i + 2)}`,
          property: "excelfile",
          code: "VALIDATION_ERROR"
        });
      }

      // mobile validation
      if (r.sm_mobile && !/^\d{10,12}$/.test(r.sm_mobile)) {
        throw CustomError.create({
          httpCode: StatusCodes.BAD_REQUEST,
          message: `Invalid mobile number for store_code ${r.store_code} in file row ${(i + 2)}`,
          property: "excelfile",
          code: "VALIDATION_ERROR"
        });
      }
    }

    // 5. Validate outlets exist
    const outletRecords = await knex(OUTLETS.NAME)
      .whereIn(OUTLETS.COLUMNS.BANK_ID, storeCodes)
      .where(OUTLETS.COLUMNS.IS_ACTIVE, true);

    const validStoreCodes = outletRecords.map(o => String(o.bankid));

    const invalidStoreCodes = storeCodes.filter(
      code => !validStoreCodes.includes(String(code))
    );

    if (invalidStoreCodes.length) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_FOUND,
        message: `Store codes not found: ${invalidStoreCodes.join(", ")}`,
        property: "store_code",
        code: "NOT_FOUND"
      });
    }

    const outletNameMap = {};

    for (const o of outletRecords) {
      outletNameMap[String(o.bankid)] = o.fullname;
    }

    const results = parsed.map((r) => {
      return {
        ...r,
        outlet_name: outletNameMap[String(r.store_code)]
      };
    });


    return {
      success: true,
      message: "store manager data validated successfully",
      total: results.length,
      data: results
    };
  }

  async function getOutletsByRegion({ params, logTrace }) {
    const knex = this;
    const { region_id } = params;

    const query = knex(OUTLETS.NAME)
      .select([
        `${OUTLETS.NAME}.${OUTLETS.COLUMNS.ID}`,
        `${OUTLETS.NAME}.${OUTLETS.COLUMNS.FULL_NAME} as outlet_name`,
        `${OUTLETS.NAME}.${OUTLETS.COLUMNS.BANK_ID}`
      ])
      .innerJoin(
        STORE_MANAGER.NAME,
        `${OUTLETS.NAME}.${OUTLETS.COLUMNS.BANK_ID}`,
        `${STORE_MANAGER.NAME}.${STORE_MANAGER.COLUMNS.STORE_CODE}`
      )
      .where(`${OUTLETS.NAME}.${OUTLETS.COLUMNS.REGION_ID}`, region_id)
      .where(`${OUTLETS.NAME}.${OUTLETS.COLUMNS.IS_ACTIVE}`, true);

    logQuery({
      logger: fastify.log,
      query: query,
      context: "Get Outlets By Region",
      logTrace
    });

    const response = await query;
    if (!response.length) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_FOUND,
        message: "No outlets found for this region",
        property: "region_id",
        code: "NOT_FOUND"
      });
    }
    return response;
  }

  async function getStoreManagersByRegion({ params, logTrace }) {
    const knex = this;
    const { region_id, page_size, current_page } = params;

    const query = knex(STORE_MANAGER.NAME)
      .select([
        `${STORE_MANAGER.NAME}.${STORE_MANAGER.COLUMNS.STORE_CODE}`,
        `${STORE_MANAGER.NAME}.${STORE_MANAGER.COLUMNS.SM_NAME}`,
        `${STORE_MANAGER.NAME}.${STORE_MANAGER.COLUMNS.SM_MOBILE}`,
        // `${STORE_MANAGER.NAME}.${STORE_MANAGER.COLUMNS.STATUS}`,
        `${OUTLETS.NAME}.${OUTLETS.COLUMNS.ID} as outlet_id`,
        `${OUTLETS.NAME}.${OUTLETS.COLUMNS.FULL_NAME} as outlet_name`
      ])
      .innerJoin(
        OUTLETS.NAME,
        `${STORE_MANAGER.NAME}.${STORE_MANAGER.COLUMNS.STORE_CODE}`,
        `${OUTLETS.NAME}.${OUTLETS.COLUMNS.BANK_ID}`
      )
      .where(`${OUTLETS.NAME}.${OUTLETS.COLUMNS.REGION_ID}`, region_id)
      .where(`${OUTLETS.NAME}.${OUTLETS.COLUMNS.IS_ACTIVE}`, true);

    logQuery({
      logger: fastify.log,
      query: query,
      context: "Get Store Managers By Region",
      logTrace
    });

    const response = await query.paginate({
      pageSize: page_size,
      currentPage: current_page
    });

    if (response.meta.pagination.total_pages < current_page) {
      throw CustomError.create({ httpCode: StatusCodes.NOT_ACCEPTABLE, message: "Requested page is beyond the available data", property: "", code: "NOT_ACCEPTABLE" });
    }

    if (!response.data.length) {
      throw CustomError.create({ httpCode: StatusCodes.NOT_FOUND, message: "No store managers found for this region", property: "region_id", code: "NOT_FOUND" });
    }

    return response;
  }

  async function exportStoreManagerExcel({ logTrace }) {
    const knex = this;

    const query = knex(STORE_MANAGER.NAME)
      .select([
        `${REGION.NAME}.${REGION.COLUMNS.REGION_NAME} as city_name`,
        `${STORE_MANAGER.NAME}.${STORE_MANAGER.COLUMNS.STORE_CODE} as store_code`,
        `${OUTLETS.NAME}.${OUTLETS.COLUMNS.FULL_NAME} as store_name`,
        `${STORE_MANAGER.NAME}.${STORE_MANAGER.COLUMNS.SM_NAME} as sm_name`,
        `${STORE_MANAGER.NAME}.${STORE_MANAGER.COLUMNS.SM_MOBILE} as sm_mobile`,
        `${USERS.NAME}.${USERS.COLUMNS.USER_NAME} as username`
      ])
      .innerJoin(OUTLETS.NAME, `${STORE_MANAGER.NAME}.${STORE_MANAGER.COLUMNS.STORE_CODE}`, `${OUTLETS.NAME}.${OUTLETS.COLUMNS.BANK_ID}`)
      .innerJoin(REGION.NAME, `${OUTLETS.NAME}.${OUTLETS.COLUMNS.REGION_ID}`, `${REGION.NAME}.${REGION.COLUMNS.ID}`)
      .leftJoin(USERS.NAME, `${STORE_MANAGER.NAME}.${STORE_MANAGER.COLUMNS.UPDATED_BY}`, `${USERS.NAME}.${USERS.COLUMNS.ID}`)
      .where(`${OUTLETS.NAME}.${OUTLETS.COLUMNS.IS_ACTIVE}`, true)
      .orderBy([
        { column: `${REGION.NAME}.${REGION.COLUMNS.REGION_NAME}`, order: "asc" },
        { column: `${STORE_MANAGER.NAME}.${STORE_MANAGER.COLUMNS.STORE_CODE}`, order: "asc" }
      ]);

    logQuery({
      logger: fastify.log,
      query: query,
      context: "Export Store Manager Excel",
      logTrace
    });

    const rows = await query;

    if (!rows.length) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_FOUND,
        message: "No store manager data found to export",
        property: "",
        code: "NOT_FOUND"
      });
    }

    return rows;
  }

  return {
    getStoreManagerList,
    getStoreManagerInfo,
    postStoreManager,
    putStoreManager,
    swapStoreManager,
    importStoreManagerExcel,
    getOutletsByRegion,
    getStoreManagersByRegion,
    exportStoreManagerExcel
  };
}

module.exports = storeManagerRepo;
