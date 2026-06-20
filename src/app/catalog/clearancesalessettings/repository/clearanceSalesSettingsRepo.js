const { StatusCodes } = require('http-status-codes');
const { CustomError } = require('../../../errorHandler');
const { logQuery } = require('../../../commons/helpers');
const { SUB_CATEGORY, MAIN_CATEGORY, CLEARANCE_SALES_SETTINGS, CLEARANCE_SALES_SETTINGS_LOGS, USERS } = require('../commons/constants');
const excelImportRepo = require('../../../Excelupload/repository/excelRepo');

function clearanceSalesSettingsRepo(fastify) {

    async function postClearanceCategoryListPage({ body, params, logTrace, userDetails }) {
        const knex = this;

        try {
            const { uploadExcelData } = excelImportRepo(fastify);
            const { page_size, current_page } = params;

            // Step 1: Read Excel
            const excelData = await uploadExcelData.call(knex, {
                body,
                params,
                logTrace
            });

            const excelColumns = excelData.headers || [];

            // Step 2: Validate required columns
            const requiredColumns = ["sub_category", "percentage"];

            const missingColumns = requiredColumns.filter(
                col => !excelColumns.includes(col)
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

            // Step 3: Clean & normalize Excel data
            const cleanedData = data.map(row => ({
                sub_category: String(row.sub_category || "").trim(),
                percentage: Number(row.percentage) || 0
            }));

            // Step 4: Remove empty subcategories
            const filteredData = cleanedData.filter(d => d.sub_category);

            if (!filteredData.length) {
                return {
                    message: "No valid data found in Excel",
                    data: []
                };
            }

            // Step 5: Get unique subcategory names
            const subCategoryNames = [
                ...new Set(filteredData.map(d => d.sub_category.toLowerCase()))
            ];

            // Step 6: Fetch matching subcategories from DB
            const dbSubCategories = await knex(SUB_CATEGORY.NAME)
                .select(SUB_CATEGORY.COLUMNS.SUBCATEGORY_NAME)
                .whereIn(
                    knex.raw(`LOWER(${SUB_CATEGORY.COLUMNS.SUBCATEGORY_NAME})`),
                    subCategoryNames
                )
                .andWhere(SUB_CATEGORY.COLUMNS.IS_ACTIVE, true);

            // Step 7: Convert DB result to Set (case-insensitive)
            const dbSet = new Set(
                dbSubCategories.map(d =>
                    d.subcategory_name.trim().toLowerCase()
                )
            );

            // Step 8: Build full response data
            const responseData = cleanedData.map(row => ({
                subcategory: row.sub_category,
                percentage: row.percentage,
                status: row.sub_category ? dbSet.has(row.sub_category.toLowerCase())
                    ? "FOUND"
                    : "NOT_FOUND" : "EMPTY_SUBCATEGORY"
            }));

            // Step 9: Paginate in-memory
            const total = responseData.length;
            const total_pages = Math.ceil(total / page_size);

            if (total_pages < current_page) {
                throw CustomError.create({
                    httpCode: StatusCodes.NOT_ACCEPTABLE,
                    message: "Requested page is beyond the available data",
                    property: "",
                    code: "NOT_ACCEPTABLE"
                });
            }

            const start = (current_page - 1) * page_size;
            const paginatedData = responseData.slice(start, start + page_size);

            return {
                success: true,
                message: "Validation completed",
                data: paginatedData,
                meta: {
                    pagination: {
                        total,
                        page_size: page_size,
                        page: current_page,
                        total_pages
                    }
                }
            };

        } catch (error) {
            console.error("Clearance Category Import Error:", error);

            throw CustomError.create({
                httpCode: error.httpCode || StatusCodes.INTERNAL_SERVER_ERROR,
                message: error.message || "Clearance category import failed.",
                property: "",
                code: error.code || "EXCEL_IMPORT_FAILED"
            });
        }
    }
    async function postClearanceCategoryList({ body, params, logTrace, userDetails }) {
        const knex = this;

        try {
            const { uploadExcelData } = excelImportRepo(fastify);
            const { page_size, current_page } = params;

            // Step 1: Read Excel
            const excelData = await uploadExcelData.call(knex, {
                body,
                params,
                logTrace
            });

            const excelColumns = excelData.headers || [];

            // Step 2: Validate required columns
            const requiredColumns = ["sub_category", "percentage"];

            const missingColumns = requiredColumns.filter(
                col => !excelColumns.includes(col)
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

            // Step 3: Clean & normalize Excel data
            const cleanedData = data.map(row => ({
                sub_category: String(row.sub_category || "").trim(),
                percentage: Number(row.percentage) || 0
            }));

            // Step 4: Remove empty subcategories
            const filteredData = cleanedData.filter(d => d.sub_category);

            if (!filteredData.length) {
                return {
                    message: "No valid data found in Excel",
                    data: []
                };
            }

            // Step 5: Get unique subcategory names
            const subCategoryNames = [
                ...new Set(filteredData.map(d => d.sub_category.toLowerCase()))
            ];

            // Step 6: Fetch matching subcategories from DB
            const dbSubCategories = await knex(SUB_CATEGORY.NAME)
                .select(SUB_CATEGORY.COLUMNS.SUBCATEGORY_NAME)
                .whereIn(
                    knex.raw(`LOWER(${SUB_CATEGORY.COLUMNS.SUBCATEGORY_NAME})`),
                    subCategoryNames
                )
                .andWhere(SUB_CATEGORY.COLUMNS.IS_ACTIVE, true);

            // Step 7: Convert DB result to Set (case-insensitive)
            const dbSet = new Set(
                dbSubCategories.map(d =>
                    d.subcategory_name.trim().toLowerCase()
                )
            );

            // Step 8: Build full response data
            const responseData = cleanedData.map(row => ({
                subcategory: row.sub_category,
                percentage: row.percentage,
                status: row.sub_category ? dbSet.has(row.sub_category.toLowerCase())
                    ? "FOUND"
                    : "NOT_FOUND" : "EMPTY_SUBCATEGORY"
            }));

          
            return {
                success: true,
                message: "Validation completed",
                data: responseData
            };

        } catch (error) {
            console.error("Clearance Category Import Error:", error);

            throw CustomError.create({
                httpCode: error.httpCode || StatusCodes.INTERNAL_SERVER_ERROR,
                message: error.message || "Clearance category import failed.",
                property: "",
                code: error.code || "EXCEL_IMPORT_FAILED"
            });
        }
    }


    async function postClearanceSalesSettings({ body, params, logTrace, userDetails }) {
        const knex = this;
        const trx = await knex.transaction();

        try {
            const { data = [] } = body;

            if (!data.length) {
                throw CustomError.create({
                    httpCode: StatusCodes.BAD_REQUEST,
                    message: "No data provided",
                    code: "INVALID_INPUT"
                });
            }

            // Step 1: Filter valid rows
            const validRows = data.filter(
                d => d.status === "FOUND" && d.subcategory?.trim()
            );

            if (!validRows.length) {
                await trx.rollback();
                return {
                    success: false,
                    message: "No valid subcategories to insert",
                    data: []
                };
            }

            // Step 2: Normalize names
            const subCategoryNames = [
                ...new Set(validRows.map(d => d.subcategory.trim().toLowerCase()))
            ];

            // Step 3: Fetch mapping
            const subCategoryData = await trx(SUB_CATEGORY.NAME)
                .join(
                    MAIN_CATEGORY.NAME,
                    `${SUB_CATEGORY.NAME}.${SUB_CATEGORY.COLUMNS.CATEGORY_ID}`,
                    `${MAIN_CATEGORY.NAME}.${MAIN_CATEGORY.COLUMNS.ID}`
                )
                .select(
                    `${SUB_CATEGORY.NAME}.${SUB_CATEGORY.COLUMNS.ID} as sub_category_id`,
                    knex.raw(`${SUB_CATEGORY.NAME}.${SUB_CATEGORY.COLUMNS.SUBCATEGORY_NAME} as subcategory_name`),
                    `${MAIN_CATEGORY.NAME}.${MAIN_CATEGORY.COLUMNS.ID} as main_category_id`
                )
                .whereIn(
                    knex.raw(`LOWER(${SUB_CATEGORY.NAME}.${SUB_CATEGORY.COLUMNS.SUBCATEGORY_NAME})`),
                    subCategoryNames
                )
                .andWhere(`${SUB_CATEGORY.NAME}.${SUB_CATEGORY.COLUMNS.IS_ACTIVE}`, true);

            // Step 4: Map lookup
            const subCategoryMap = new Map(
                subCategoryData.map(item => [
                    item.subcategory_name,
                    {
                        sub_category_id: item.sub_category_id,
                        main_category_id: item.main_category_id
                    }
                ])
            );

            // Step 5: Prepare insert data
            const insertData = validRows
                .map(item => {
                    const key = item.subcategory.trim();
                    const mapping = subCategoryMap.get(key);

                    if (!mapping) return null;

                    return {
                        [CLEARANCE_SALES_SETTINGS.COLUMNS.MAIN_CATEGORY_ID]:
                            mapping.main_category_id,

                        [CLEARANCE_SALES_SETTINGS.COLUMNS.SUB_CATEGORY_ID]:
                            mapping.sub_category_id,

                        [CLEARANCE_SALES_SETTINGS.COLUMNS.PERCENTAGE]:
                            Number(item.percentage) || 0,

                        [CLEARANCE_SALES_SETTINGS.COLUMNS.CREATED_BY]:
                            userDetails.id,

                        [CLEARANCE_SALES_SETTINGS.COLUMNS.UPDATED_BY]:
                            userDetails.id,
                        [CLEARANCE_SALES_SETTINGS.COLUMNS.DOWN_OUTLET_IDS]: []
                    };
                })
                .filter(Boolean);

            if (!insertData.length) {
                await trx.rollback();
                return {
                    success: false,
                    message: "No matching subcategories found in DB",
                    data: []
                };
            }

            //  Step 6: Fetch OLD DATA
            const subCategoryIds = insertData.map(
                d => d[CLEARANCE_SALES_SETTINGS.COLUMNS.SUB_CATEGORY_ID]
            );

            const existingRows = await trx(CLEARANCE_SALES_SETTINGS.NAME)
                .whereIn(CLEARANCE_SALES_SETTINGS.COLUMNS.SUB_CATEGORY_ID, subCategoryIds);

            const existingMap = new Map(
                existingRows.map(row => [row.sub_category_id, row])
            );

            // Step 7: Filter to only update/insert if percentage changed
            const filteredInsertData = insertData.filter(item => {
                const existing = existingMap.get(item[CLEARANCE_SALES_SETTINGS.COLUMNS.SUB_CATEGORY_ID]);
                if (!existing) return true; // new entry, insert
                return Number(existing.percentage) !== Number(item[CLEARANCE_SALES_SETTINGS.COLUMNS.PERCENTAGE]); // update only if percentage changed
            });

            if (!filteredInsertData.length) {
                await trx.rollback();
                return {
                    success: false,
                    message: "No changes detected in percentage values",
                    data: []
                };
            }

            //  Step 8: UPSERT + RETURNING NEW DATA
            const upsertedRows = await trx(CLEARANCE_SALES_SETTINGS.NAME)
                .insert(filteredInsertData)
                .onConflict(CLEARANCE_SALES_SETTINGS.COLUMNS.SUB_CATEGORY_ID)
                .merge({
                    [CLEARANCE_SALES_SETTINGS.COLUMNS.DOWN_OUTLET_IDS]: [],
                    [CLEARANCE_SALES_SETTINGS.COLUMNS.PERCENTAGE]: knex.raw("EXCLUDED.percentage"),
                    [CLEARANCE_SALES_SETTINGS.COLUMNS.UPDATED_BY]: userDetails.id,
                    [CLEARANCE_SALES_SETTINGS.COLUMNS.UPDATED_AT]: knex.fn.now()
                })
                .returning("*");

            //  Step 9: Prepare logs
            const logs = upsertedRows.map(newRow => {
                const oldRow = existingMap.get(newRow.sub_category_id);

                return {
                    [CLEARANCE_SALES_SETTINGS_LOGS.COLUMNS.OPERATION_NAME]:
                        oldRow ? "UPDATE" : "CREATE",

                    [CLEARANCE_SALES_SETTINGS_LOGS.COLUMNS.OLD_DATA]:
                        oldRow ? JSON.stringify({ "clearance_sales_settings": oldRow }) : null,

                    [CLEARANCE_SALES_SETTINGS_LOGS.COLUMNS.NEW_DATA]:
                        JSON.stringify({ "clearance_sales_settings": newRow }),

                    [CLEARANCE_SALES_SETTINGS_LOGS.COLUMNS.USER_ID]:
                        userDetails.id,

                    [CLEARANCE_SALES_SETTINGS_LOGS.COLUMNS.USER_NAME]:
                        userDetails.user_name,

                    [CLEARANCE_SALES_SETTINGS_LOGS.COLUMNS.CLEARANCE_SALES_SETTINGS_ID]:
                        newRow.id
                };
            });

            //  Step 10: Insert logs
            if (logs.length) {
                await trx(CLEARANCE_SALES_SETTINGS_LOGS.NAME).insert(logs);
            }

            await trx.commit();

            return {
                success: true,
                message: "Clearance sales settings saved successfully",
                count: upsertedRows.length
            };

        } catch (error) {
            await trx.rollback();

            console.error(error);

            throw CustomError.create({
                httpCode: StatusCodes.INTERNAL_SERVER_ERROR,
                message: error.message || "Failed to save clearance sales settings",
                code: "CLEARANCE_SALES_SETTINGS_SAVE_FAILED"
            });
        }
    }

    async function exportClearanceSalesSettings({ body, params, logTrace, userDetails }) {
        const knex = this;

        try {

            const query = knex(CLEARANCE_SALES_SETTINGS.NAME)
                .select([
                    `${CLEARANCE_SALES_SETTINGS.NAME}.${CLEARANCE_SALES_SETTINGS.COLUMNS.CREATED_AT} as created_on`,
                    `${CLEARANCE_SALES_SETTINGS.NAME}.${CLEARANCE_SALES_SETTINGS.COLUMNS.UPDATED_AT} as modified_on`,
                    `${USERS.NAME}.${USERS.COLUMNS.USER_NAME} as user_name`,
                    `${MAIN_CATEGORY.NAME}.${MAIN_CATEGORY.COLUMNS.CATEGORY_NAME} as main_category`,
                    `${SUB_CATEGORY.NAME}.${SUB_CATEGORY.COLUMNS.SUBCATEGORY_NAME} as sub_category`,
                    `${CLEARANCE_SALES_SETTINGS.NAME}.${CLEARANCE_SALES_SETTINGS.COLUMNS.PERCENTAGE} as percentage`
                ])

                //  Join Sub Category
                .innerJoin(
                    SUB_CATEGORY.NAME,
                    `${CLEARANCE_SALES_SETTINGS.NAME}.${CLEARANCE_SALES_SETTINGS.COLUMNS.SUB_CATEGORY_ID}`,
                    `${SUB_CATEGORY.NAME}.${SUB_CATEGORY.COLUMNS.ID}`
                )

                //  Join Main Category
                .innerJoin(
                    MAIN_CATEGORY.NAME,
                    `${CLEARANCE_SALES_SETTINGS.NAME}.${CLEARANCE_SALES_SETTINGS.COLUMNS.MAIN_CATEGORY_ID}`,
                    `${MAIN_CATEGORY.NAME}.${MAIN_CATEGORY.COLUMNS.ID}`
                )

                //  Join Users (for user_name)
                .leftJoin(
                    USERS.NAME,
                    `${CLEARANCE_SALES_SETTINGS.NAME}.${CLEARANCE_SALES_SETTINGS.COLUMNS.UPDATED_BY}`,
                    `${USERS.NAME}.${USERS.COLUMNS.ID}`
                )

                //  Optional filters
                .where(`${SUB_CATEGORY.NAME}.${SUB_CATEGORY.COLUMNS.IS_ACTIVE}`, true)
                .andWhere(`${MAIN_CATEGORY.NAME}.${MAIN_CATEGORY.COLUMNS.IS_ACTIVE}`, true);


            logQuery({
                logger: fastify.log,
                query: query,
                context: "Export Clearance Sales Settings Excel",
                logTrace
            });

            const rows = await query;

            if (!rows.length) {
                throw CustomError.create({
                    httpCode: StatusCodes.NOT_FOUND,
                    message: "No clearance sales settings data found to export",
                    property: "",
                    code: "NOT_FOUND"
                });
            }

            return rows.map(row => ({
                ...row,
                created_on: row.created_on ? new Date(row.created_on) : null,
                modified_on: row.modified_on ? new Date(row.modified_on) : null,
                percentage: Number(row.percentage)
            }));

        } catch (error) {
            console.error("Clearance Sales Settings Export Error:", error);

            throw CustomError.create({
                httpCode: StatusCodes.INTERNAL_SERVER_ERROR,
                message: error.message || "Failed to export clearance sales settings",
                code: "CLEARANCE_SALES_SETTINGS_EXPORT_FAILED"
            });
        }
    }

    return {
        postClearanceCategoryList,
        postClearanceCategoryListPage,
        postClearanceSalesSettings,
        exportClearanceSalesSettings
    };
}

module.exports = clearanceSalesSettingsRepo;
