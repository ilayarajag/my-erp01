const { StatusCodes } = require("http-status-codes");
const { CustomError } = require("../../../errorHandler");
const { logQuery } = require("../../../commons/helpers");
const { PARENT_CHILD_CONVERSION, PARENT_CHILD_CONVERSION_LOGS, ITEM, OUTLETS, REGION, USERS } = require("../commons/constants");
const excelImportRepo = require("../../../Excelupload/repository/excelRepo");

function parentChildConversionRepo(fastify) {

  // Helper: lookup items by pro_code array, returns map { pro_code -> { id, pro_name } }
  async function getItemsByCode(knex, codes) {
    const rows = await knex(ITEM.NAME)
      .select([ITEM.COLUMNS.ID, ITEM.COLUMNS.PRODUCT_CODE, ITEM.COLUMNS.PRODUCT_NAME])
      .whereIn(ITEM.COLUMNS.PRODUCT_CODE, codes)
      .where(ITEM.COLUMNS.IS_ACTIVE, 1);
    const map = {};
    for (const r of rows) map[String(r[ITEM.COLUMNS.PRODUCT_CODE])] = r;
    return map;
  }

  // 1. IMPORT EXCEL VALIDATION
  async function importParentChildExcel({ body, logTrace }) {
    const knex = this;
    const { uploadExcelData } = excelImportRepo(fastify);

    const excelData = await uploadExcelData.call(knex, { body, logTrace });
    const { headers = [], data = [] } = excelData;

    const normalizedHeaders = headers.map(h => String(h).toLowerCase().trim());
    const requiredHeaders = ["parent_code", "child_code", "quantity"];
    const missing = requiredHeaders.filter(h => !normalizedHeaders.includes(h));

    if (missing.length) {
      throw CustomError.create({
        httpCode: StatusCodes.BAD_REQUEST,
        message: `Missing required columns: ${missing.join(", ")}`,
        property: "excelfile",
        code: "MISSING_COLUMNS"
      });
    }

    if (!data.length) {
      return { message: "Validation completed", valid_count: 0, error_count: 0, data: [], errors: [] };
    }

    // Collect all codes for batch lookup
    const allparent_codes = data.map(r => String(r["parent_code"] ?? "").trim()).filter(Boolean);
    const allchild_codes = data.map(r => String(r["child_code"] ?? "").trim()).filter(Boolean);
    const allCodes = [...new Set([...allparent_codes, ...allchild_codes])];

    const itemMap = await getItemsByCode(knex, allCodes);

    const validData = [];
    const errors = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNum = i + 2;
      const parent_code = String(row["parent_code"] ?? "").trim();
      const child_code = String(row["child_code"] ?? "").trim();
      const quantity = parseFloat(row["quantity"]);

      if (!parent_code) {
        errors.push(`Row ${rowNum}: Parent code is missing`);
        continue;
      }
      if (!itemMap[parent_code]) {
        errors.push(`Row ${rowNum}: Parent code ${parent_code} not found`);
        continue;
      }
      if (!child_code) {
        errors.push(`Row ${rowNum}: Child code is missing`);
        continue;
      }
      if (!itemMap[child_code]) {
        errors.push(`Row ${rowNum}: Child code ${child_code} not found`);
        continue;
      }
      if (isNaN(quantity) || quantity <= 0) {
        errors.push(`Row ${rowNum}: Quantity is invalid or not a number`);
        continue;
      }

      validData.push({
        row: rowNum,
        parent_code: Number(parent_code),
        parent_name: itemMap[parent_code][ITEM.COLUMNS.PRODUCT_NAME],
        child_code: Number(child_code),
        child_name: itemMap[child_code][ITEM.COLUMNS.PRODUCT_NAME],
        quantity
      });
    }

    return {
      message: "Validation completed",
      valid_count: validData.length,
      error_count: errors.length,
      data: validData,
      errors
    };
  }

  // 2. CREATE (bulk)
  async function postParentChildConversion({ body, logTrace, userDetails }) {
    const knex = this;
    const { data = [] } = body;

    if (!Array.isArray(data) || !data.length) {
      throw CustomError.create({
        httpCode: StatusCodes.BAD_REQUEST,
        message: "data must be a non-empty array",
        property: "data",
        code: "VALIDATION_ERROR"
      });
    }

    //  1. Collect all item codes
    const allCodes = [...new Set(
      data.flatMap(r => [
        r.parent_code?.toString().trim(),
        r.child_code?.toString().trim()
      ])
    )];

    const itemMap = await getItemsByCode(knex, allCodes);

    //  2. Collect all outlet_ids
    const allOutletIds = [...new Set(
      data.flatMap(r => Array.isArray(r.outlet_ids) ? r.outlet_ids : [])
    )];

    const outletRows = await knex(OUTLETS.NAME)
      .select(OUTLETS.COLUMNS.ID)
      .whereIn(OUTLETS.COLUMNS.ID, allOutletIds)
      .andWhere(OUTLETS.COLUMNS.IS_ACTIVE, true);

    const outletSet = new Set(outletRows.map(o => o.id));

    //  3. Fetch existing parent-child combinations (once)
    const existingRows = await knex(PARENT_CHILD_CONVERSION.NAME)
      .select(
        PARENT_CHILD_CONVERSION.COLUMNS.PARENT_ID,
        PARENT_CHILD_CONVERSION.COLUMNS.CHILD_ID
      );

    const existingSet = new Set(
      existingRows.map(r => `${r.parent_id}_${r.child_id}`)
    );

    const insertRows = [];
    const errors = [];

    //  4. Process data
    for (let i = 0; i < data.length; i++) {
      const row = data[i];

      const parent_code = row.parent_code?.toString().trim();
      const child_code = row.child_code?.toString().trim();

      if (!parent_code || !child_code) {
        errors.push(`Index ${i}: parent_code or child_code missing`);
        continue;
      }

      const parentItem = itemMap[parent_code];
      const childItem = itemMap[child_code];

      if (!parentItem) {
        errors.push(`Index ${i}: Parent code ${parent_code} not found`);
        continue;
      }

      if (!childItem) {
        errors.push(`Index ${i}: Child code ${child_code} not found`);
        continue;
      }

      //  Quantity validation
      const qty = Number(row.quantity);
      if (!Number.isFinite(qty) || qty <= 0) {
        errors.push(`Index ${i}: Invalid quantity`);
        continue;
      }

      //  Fixed outlet_ids validation
      if (!Array.isArray(row.outlet_ids) || !row.outlet_ids.length) {
        errors.push(`Index ${i}: outlet_ids must be a non-empty array`);
        continue;
      }

      //  Validate outlets (no DB call here)
      const invalidOutlet = row.outlet_ids.some(id => !outletSet.has(id));
      if (invalidOutlet) {
        errors.push(`Index ${i}: One or more outlet_ids are invalid`);
        continue;
      }

      const parentId = parentItem[ITEM.COLUMNS.PRODUCT_CODE];
      const childId = childItem[ITEM.COLUMNS.PRODUCT_CODE];

      const key = `${parentId}_${childId}`;

      if (existingSet.has(key)) {
        errors.push(`Index ${i}: Combination ${parent_code}-${child_code} already exists`);
        continue;
      }

      // Prevent duplicate within same request
      if (insertRows.some(r => r.parent_id === parentId && r.child_id === childId)) {
        errors.push(`Index ${i}: Duplicate combination in request`);
        continue;
      }

      insertRows.push({
        [PARENT_CHILD_CONVERSION.COLUMNS.PARENT_ID]: parentId,
        [PARENT_CHILD_CONVERSION.COLUMNS.CHILD_ID]: childId,
        [PARENT_CHILD_CONVERSION.COLUMNS.QUANTITY]: qty,
        [PARENT_CHILD_CONVERSION.COLUMNS.OUTLET_IDS]: row.outlet_ids,
        [PARENT_CHILD_CONVERSION.COLUMNS.DOWN_OUTLET_IDS]: [],
        [PARENT_CHILD_CONVERSION.COLUMNS.DOWN_DT]: null,
        [PARENT_CHILD_CONVERSION.COLUMNS.CREATED_BY]: userDetails.id,
        [PARENT_CHILD_CONVERSION.COLUMNS.UPDATED_BY]: userDetails.id,
        [PARENT_CHILD_CONVERSION.COLUMNS.CREATED_AT]: new Date(),
        [PARENT_CHILD_CONVERSION.COLUMNS.UPDATED_AT]: new Date()
      });
    }

    //  5. Throw all validation errors together
    if (errors.length) {
      throw CustomError.create({
        httpCode: StatusCodes.CONFLICT,
        message: errors.join("; "),
        property: "data",
        code: "CONFLICT"
      });
    }

    //  6. Insert once
    const query = knex(PARENT_CHILD_CONVERSION.NAME)
      .insert(insertRows)
      .returning("*");

    logQuery({
      logger: fastify.log,
      query,
      context: "Post Parent Child Conversion",
      logTrace
    });

    const insertedRecords = await query;

    // Create audit logs for each inserted record
    if (Array.isArray(insertedRecords) && insertedRecords.length > 0) {
      for (const record of insertedRecords) {
        await knex(PARENT_CHILD_CONVERSION_LOGS.NAME).insert({
          [PARENT_CHILD_CONVERSION_LOGS.COLUMNS.OPERATION_NAME]: "CREATE",
          [PARENT_CHILD_CONVERSION_LOGS.COLUMNS.PARENT_CHILD_CONVERSION_ID]: record[PARENT_CHILD_CONVERSION.COLUMNS.ID],
          [PARENT_CHILD_CONVERSION_LOGS.COLUMNS.OLD_DATA]: null,
          [PARENT_CHILD_CONVERSION_LOGS.COLUMNS.NEW_DATA]: JSON.stringify({
            parent_child_conversion: record
          }),
          [PARENT_CHILD_CONVERSION_LOGS.COLUMNS.USER_ID]: userDetails.id,
          [PARENT_CHILD_CONVERSION_LOGS.COLUMNS.USER_NAME]: userDetails.user_name,
          [PARENT_CHILD_CONVERSION_LOGS.COLUMNS.CREATED_AT]: new Date()
        });
      }
    }

    return { success: true };
  }

  // 3. UPDATE
  async function putParentChildConversion({ params, body, logTrace, userDetails }) {
    const knex = this;
    const { parent_child_conv_id } = params;

    const existing = await knex(PARENT_CHILD_CONVERSION.NAME)
      .where(PARENT_CHILD_CONVERSION.COLUMNS.ID, parent_child_conv_id)
      .first();

    if (!existing) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_FOUND,
        message: "Parent child conversion not found",
        property: "parent_child_conv_id",
        code: "NOT_FOUND"
      });
    }

    const updateData = {
      [PARENT_CHILD_CONVERSION.COLUMNS.UPDATED_BY]: userDetails.id,
      [PARENT_CHILD_CONVERSION.COLUMNS.UPDATED_AT]: new Date()
    };

    // Resolve parent_id from parent_code if provided
    if (body.parent_code) {
      const parentItem = await knex(ITEM.NAME)
        .where(ITEM.COLUMNS.PRODUCT_CODE, String(body.parent_code))
        .where(ITEM.COLUMNS.IS_ACTIVE, true)
        .first();
      if (!parentItem) {
        throw CustomError.create({
          httpCode: StatusCodes.NOT_FOUND,
          message: `Parent code ${body.parent_code} not found`,
          property: "parent_code",
          code: "NOT_FOUND"
        });
      }
      updateData[PARENT_CHILD_CONVERSION.COLUMNS.PARENT_ID] = parentItem[ITEM.COLUMNS.PRODUCT_CODE];
    }

    // Resolve child_id from child_code if provided
    if (body.child_code) {
      const childItem = await knex(ITEM.NAME)
        .where(ITEM.COLUMNS.PRODUCT_CODE, String(body.child_code))
        .where(ITEM.COLUMNS.IS_ACTIVE, 1)
        .first();
      if (!childItem) {
        throw CustomError.create({
          httpCode: StatusCodes.NOT_FOUND,
          message: `Child code ${body.child_code} not found`,
          property: "child_code",
          code: "NOT_FOUND"
        });
      }
      updateData[PARENT_CHILD_CONVERSION.COLUMNS.CHILD_ID] = childItem[ITEM.COLUMNS.PRODUCT_CODE];
    }

    // Unique check: if parent_id or child_id changed, validate no duplicate
    const newParentId = updateData[PARENT_CHILD_CONVERSION.COLUMNS.PARENT_ID] ?? existing[PARENT_CHILD_CONVERSION.COLUMNS.PARENT_ID];
    const newChildId = updateData[PARENT_CHILD_CONVERSION.COLUMNS.CHILD_ID] ?? existing[PARENT_CHILD_CONVERSION.COLUMNS.CHILD_ID];

    if (
      newParentId !== existing[PARENT_CHILD_CONVERSION.COLUMNS.PARENT_ID] ||
      newChildId !== existing[PARENT_CHILD_CONVERSION.COLUMNS.CHILD_ID]
    ) {
      const duplicate = await knex(PARENT_CHILD_CONVERSION.NAME)
        .where(PARENT_CHILD_CONVERSION.COLUMNS.PARENT_ID, newParentId)
        .where(PARENT_CHILD_CONVERSION.COLUMNS.CHILD_ID, newChildId)
        .whereNot(PARENT_CHILD_CONVERSION.COLUMNS.ID, parent_child_conv_id)
        .first();

      if (duplicate) {
        throw CustomError.create({
          httpCode: StatusCodes.CONFLICT,
          message: "This parent and child combination already exists",
          property: "parent_code/child_code",
          code: "CONFLICT"
        });
      }
    }

    if (body.quantity) updateData[PARENT_CHILD_CONVERSION.COLUMNS.QUANTITY] = parseFloat(body.quantity);
    if (body.outlet_ids) {
      // validate outlet ids 
      const outletRows = await knex(OUTLETS.NAME)
        .select(OUTLETS.COLUMNS.ID)
        .whereIn(OUTLETS.COLUMNS.ID, body.outlet_ids)
        .andWhere(OUTLETS.COLUMNS.IS_ACTIVE, true);
      const outletSet = new Set(outletRows.map(o => o.id));
      const invalidOutlet = body.outlet_ids.filter(id => !outletSet.has(id));
      if (invalidOutlet.length > 0) {
        throw CustomError.create({
          httpCode: StatusCodes.NOT_FOUND,
          message: `outlet_ids [${invalidOutlet.join(",")}] are invalid`,
          property: "outlet_ids",
          code: "NOT_FOUND"
        });
      }

      updateData[PARENT_CHILD_CONVERSION.COLUMNS.OUTLET_IDS] = body.outlet_ids;
    }

    const query = knex(PARENT_CHILD_CONVERSION.NAME)
      .where(PARENT_CHILD_CONVERSION.COLUMNS.ID, parent_child_conv_id)
      .update(updateData)
      .returning("*");

    logQuery({
      logger: fastify.log,
      query,
      context: "Put Parent Child Conversion",
      logTrace
    });

    const result = await query;
    if (!result) {
      throw CustomError.create({
        httpCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Error while updating",
        property: "",
        code: "UPDATE_FAILED"
      });
    }

    // Create audit log for update operation
    if (result && result.length > 0) {

      await knex(PARENT_CHILD_CONVERSION_LOGS.NAME).insert({
        [PARENT_CHILD_CONVERSION_LOGS.COLUMNS.OPERATION_NAME]: "UPDATE",
        [PARENT_CHILD_CONVERSION_LOGS.COLUMNS.PARENT_CHILD_CONVERSION_ID]: parent_child_conv_id,
        [PARENT_CHILD_CONVERSION_LOGS.COLUMNS.OLD_DATA]: JSON.stringify({ parent_child_conversion: existing }),
        [PARENT_CHILD_CONVERSION_LOGS.COLUMNS.NEW_DATA]: JSON.stringify({ body: body }),
        [PARENT_CHILD_CONVERSION_LOGS.COLUMNS.USER_ID]: userDetails.id,
        [PARENT_CHILD_CONVERSION_LOGS.COLUMNS.USER_NAME]: userDetails.user_name,
        created_at: new Date()
      });
    }
    return { success: true };
  }

  // 4. LIST with search + pagination
  async function getParentChildConversionList({ params, query: queryString, logTrace }) {
    const knex = this;
    const { page_size, current_page } = params;
    const { search, region_id, outlet_id } = queryString;

    const parentItem = `parent_item`;
    const childItem = `child_item`;

    const regionIdNum = Number(region_id);
    const outletIdNum = Number(outlet_id);

    let query = knex(PARENT_CHILD_CONVERSION.NAME)
      .select([
        `${PARENT_CHILD_CONVERSION.NAME}.${PARENT_CHILD_CONVERSION.COLUMNS.ID} as id`,
        `${PARENT_CHILD_CONVERSION.NAME}.${PARENT_CHILD_CONVERSION.COLUMNS.QUANTITY} as quantity`,
        `${PARENT_CHILD_CONVERSION.NAME}.${PARENT_CHILD_CONVERSION.COLUMNS.OUTLET_IDS} as outlet_ids`,
        `${PARENT_CHILD_CONVERSION.NAME}.${PARENT_CHILD_CONVERSION.COLUMNS.CREATED_AT} as created_at`,
        `${PARENT_CHILD_CONVERSION.NAME}.${PARENT_CHILD_CONVERSION.COLUMNS.UPDATED_AT} as updated_at`,

        `${parentItem}.${ITEM.COLUMNS.PRODUCT_CODE} as parent_code`,
        `${parentItem}.${ITEM.COLUMNS.PRODUCT_NAME} as parent_name`,

        `${childItem}.${ITEM.COLUMNS.PRODUCT_CODE} as child_code`,
        `${childItem}.${ITEM.COLUMNS.PRODUCT_NAME} as child_name`,

        `${OUTLETS.NAME}.${OUTLETS.COLUMNS.BANK_ID} as store_code`,
        `${OUTLETS.NAME}.${OUTLETS.COLUMNS.FULL_NAME} as outlet_name`,
        `${REGION.NAME}.${REGION.COLUMNS.REGION_NAME} as region`,
        `${OUTLETS.NAME}.${OUTLETS.COLUMNS.ID} as outlet_id`,

        `${USERS.NAME}.${USERS.COLUMNS.USER_NAME} as user_name`
      ])

      // outlet join
      .joinRaw(`
    JOIN ${OUTLETS.NAME}
    ON ${OUTLETS.NAME}.${OUTLETS.COLUMNS.ID} = ANY(${PARENT_CHILD_CONVERSION.NAME}.${PARENT_CHILD_CONVERSION.COLUMNS.OUTLET_IDS})
  `)

      //  FIXED parent join (int → text)
      .joinRaw(`
    JOIN ${ITEM.NAME} as ${parentItem}
    ON CAST(${PARENT_CHILD_CONVERSION.NAME}.${PARENT_CHILD_CONVERSION.COLUMNS.PARENT_ID} AS TEXT)
    = CAST(${parentItem}.${ITEM.COLUMNS.PRODUCT_CODE} AS TEXT)
  `)

      //  FIXED child join
      .joinRaw(`
    JOIN ${ITEM.NAME} as ${childItem}
    ON CAST(${PARENT_CHILD_CONVERSION.NAME}.${PARENT_CHILD_CONVERSION.COLUMNS.CHILD_ID} AS TEXT)
    = ${childItem}.${ITEM.COLUMNS.PRODUCT_CODE}
  `)

      // user join
      .join(
        USERS.NAME,
        `${USERS.NAME}.${USERS.COLUMNS.ID}`,
        `${PARENT_CHILD_CONVERSION.NAME}.${PARENT_CHILD_CONVERSION.COLUMNS.CREATED_BY}`
      )
      .join(
        REGION.NAME,
        `${OUTLETS.NAME}.${OUTLETS.COLUMNS.REGION_ID}`,
        `${REGION.NAME}.${REGION.COLUMNS.ID}`
      )
      .orderBy(`${OUTLETS.NAME}.${OUTLETS.COLUMNS.FULL_NAME}`, "asc");

    if (search && search.trim()) {
      query.where(function () {
        this.where(`${OUTLETS.NAME}.${OUTLETS.COLUMNS.FULL_NAME}`, "ilike", `%${search}%`)
          .orWhere(`${OUTLETS.NAME}.${OUTLETS.COLUMNS.BANK_ID}`, "ilike", `%${search}%`)
          .orWhere(`${USERS.NAME}.${USERS.COLUMNS.USER_NAME}`, "ilike", `%${search}%`)
          .orWhere(`${parentItem}.${ITEM.COLUMNS.PRODUCT_NAME}`, "ilike", `%${search}%`)
          .orWhere(`${childItem}.${ITEM.COLUMNS.PRODUCT_NAME}`, "ilike", `%${search}%`)
          .orWhereRaw(`${parentItem}.${ITEM.COLUMNS.PRODUCT_CODE}::text ILIKE ?`, [`%${search}%`])
          .orWhereRaw(`${childItem}.${ITEM.COLUMNS.PRODUCT_CODE}::text ILIKE ?`, [`%${search}%`])
          .orWhereRaw(`${PARENT_CHILD_CONVERSION.NAME}.${PARENT_CHILD_CONVERSION.COLUMNS.QUANTITY}::text ILIKE ?`, [`%${search}%`]);
      });
    }

    if (Number.isInteger(regionIdNum) && regionIdNum !== -1) {
      query.where(`${REGION.NAME}.${REGION.COLUMNS.ID}`, regionIdNum);
    }

    if (Number.isInteger(regionIdNum) && regionIdNum !== -1 && Number.isInteger(outletIdNum) && outletIdNum !== -1) {
      query.where(`${OUTLETS.NAME}.${OUTLETS.COLUMNS.REGION_ID}`, regionIdNum)
        .andWhere(`${OUTLETS.NAME}.${OUTLETS.COLUMNS.ID}`, outletIdNum);
    }

    logQuery({
      logger: fastify.log,
      query,
      context: "Get Parent Child Conversion List",
      logTrace
    });

    const response = await query.paginate({
      pageSize: Number(page_size),
      currentPage: Number(current_page)
    });

    if (response.meta.pagination.total_pages < current_page) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_ACCEPTABLE,
        message: "Requested page is beyond the available data",
        code: "NOT_ACCEPTABLE"
      });
    }

    if (!response.data.length) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_FOUND,
        message: "No records found",
        code: "NOT_FOUND"
      });
    }

    return response;
  }

  // 5. GET SINGLE INFO
  async function getParentChildConversionInfo({ params, logTrace }) {
    const knex = this;
    const { parent_child_conv_id } = params;

    const parentItem = `parent_item`;
    const childItem = `child_item`;

    const query = knex(PARENT_CHILD_CONVERSION.NAME)
      .select([
        `${PARENT_CHILD_CONVERSION.NAME}.${PARENT_CHILD_CONVERSION.COLUMNS.ID} as id`,
        `${PARENT_CHILD_CONVERSION.NAME}.${PARENT_CHILD_CONVERSION.COLUMNS.QUANTITY} as quantity`,
        `${PARENT_CHILD_CONVERSION.NAME}.${PARENT_CHILD_CONVERSION.COLUMNS.OUTLET_IDS} as outlet_ids`,
        `${parentItem}.${ITEM.COLUMNS.PRODUCT_CODE} as parent_code`,
        `${parentItem}.${ITEM.COLUMNS.PRODUCT_NAME} as parent_name`,
        `${childItem}.${ITEM.COLUMNS.PRODUCT_CODE} as child_code`,
        `${childItem}.${ITEM.COLUMNS.PRODUCT_NAME} as child_name`
      ])
      // parent join
      .joinRaw(`
    JOIN ${ITEM.NAME} as ${parentItem}
    ON ${PARENT_CHILD_CONVERSION.NAME}.${PARENT_CHILD_CONVERSION.COLUMNS.PARENT_ID}
    = CAST(${parentItem}.${ITEM.COLUMNS.PRODUCT_CODE} AS INTEGER)
  `)
      // child join
      .joinRaw(`
    JOIN ${ITEM.NAME} as ${childItem}
    ON ${PARENT_CHILD_CONVERSION.NAME}.${PARENT_CHILD_CONVERSION.COLUMNS.CHILD_ID}
    = CAST(${childItem}.${ITEM.COLUMNS.PRODUCT_CODE} AS INTEGER)
  `)
      .where(
        `${PARENT_CHILD_CONVERSION.NAME}.${PARENT_CHILD_CONVERSION.COLUMNS.ID}`,
        parent_child_conv_id
      )
      .first();

    logQuery({
      logger: fastify.log,
      query,
      context: "Get Parent Child Conversion Info",
      logTrace
    });

    const result = await query;
    if (!result) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_FOUND,
        message: "Parent child conversion not found",
        property: "id",
        code: "NOT_FOUND"
      });
    }
    return result;
  }

  // 6. EXPORT EXCEL
  async function exportParentChildConversionExcel({ logTrace }) {
    const knex = this;

    const parentItem = `parent_item`;
    const childItem = `child_item`;

    const query = knex(PARENT_CHILD_CONVERSION.NAME)
      .select([
        `${REGION.NAME}.${REGION.COLUMNS.REGION_NAME} as region`,
        `${OUTLETS.NAME}.${OUTLETS.COLUMNS.FULL_NAME} as outlet_name`,
        `${OUTLETS.NAME}.${OUTLETS.COLUMNS.BANK_ID} as store_code`,
        `${parentItem}.${ITEM.COLUMNS.PRODUCT_CODE} as parent_code`,
        `${parentItem}.${ITEM.COLUMNS.PRODUCT_NAME} as parent_name`,
        `${childItem}.${ITEM.COLUMNS.PRODUCT_CODE} as child_code`,
        `${childItem}.${ITEM.COLUMNS.PRODUCT_NAME} as child_name`,
        `${PARENT_CHILD_CONVERSION.NAME}.${PARENT_CHILD_CONVERSION.COLUMNS.QUANTITY} as quantity`,
        `${USERS.NAME}.${USERS.COLUMNS.USER_NAME} as username`
      ])
      .joinRaw(`JOIN ${ITEM.NAME} as ${parentItem} 
        ON ${PARENT_CHILD_CONVERSION.NAME}.${PARENT_CHILD_CONVERSION.COLUMNS.PARENT_ID} =
         CAST(${parentItem}.${ITEM.COLUMNS.PRODUCT_CODE} AS INTEGER )`)

      .joinRaw(`JOIN ${ITEM.NAME} as ${childItem} 
        ON ${PARENT_CHILD_CONVERSION.NAME}.${PARENT_CHILD_CONVERSION.COLUMNS.PARENT_ID} =
         CAST(${childItem}.${ITEM.COLUMNS.PRODUCT_CODE} AS INTEGER )`)

      .joinRaw(`JOIN ${OUTLETS.NAME} 
        ON ${OUTLETS.NAME}.${OUTLETS.COLUMNS.ID} = ANY(${PARENT_CHILD_CONVERSION.NAME}.${PARENT_CHILD_CONVERSION.COLUMNS.OUTLET_IDS})`)

      .innerJoin(REGION.NAME,
        `${OUTLETS.NAME}.${OUTLETS.COLUMNS.REGION_ID}`,
        `${REGION.NAME}.${REGION.COLUMNS.ID}`)

      .join(USERS.NAME,
        `${PARENT_CHILD_CONVERSION.NAME}.${PARENT_CHILD_CONVERSION.COLUMNS.UPDATED_BY}`,
        `${USERS.NAME}.${USERS.COLUMNS.ID}`)

      .where(`${OUTLETS.NAME}.${OUTLETS.COLUMNS.IS_ACTIVE}`, true)
      .orderBy([
        { column: `${OUTLETS.NAME}.${OUTLETS.COLUMNS.FULL_NAME}`, order: "asc" }
      ]);

    logQuery({
      logger: fastify.log,
      query,
      context: "Export Parent Child Conversion Excel",
      logTrace
    });

    const rows = await query;

    if (!rows.length) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_FOUND,
        message: "No data found to export",
        property: "",
        code: "NOT_FOUND"
      });
    }

    return rows.map((r, i) => ({
      sno: i + 1,
      region: r.region,
      outlet_name: r.outlet_name,
      store_code: Number(r.store_code) || r.store_code,
      parent_code: Number(r.parent_code) || r.parent_code,
      parent_name: r.parent_name,
      child_code: Number(r.child_code) || r.child_code,
      child_name: r.child_name,
      quantity: Number(r.quantity) || r.quantity,
      username: r.username
    }));
  }

  return {
    importParentChildExcel,
    postParentChildConversion,
    putParentChildConversion,
    getParentChildConversionList,
    getParentChildConversionInfo,
    exportParentChildConversionExcel
  };

}

module.exports = parentChildConversionRepo;
