const { StatusCodes } = require('http-status-codes');
const { CustomError } = require('../../../errorHandler');
const { logQuery } = require('../../../commons/helpers');
const { OUTLET_SETTINGS, OUTLET_SETTINGS_MASTER, OUTLETS, REGION } = require('../commons/constants');
const { queryString } = require('../../outletmembers/schemas/getOutletMembersListSchema');

function outletSettingsRepo(fastify) {

    async function postOutletSetting({ body, logTrace, userDetails }) {
        const knex = this;

        const trx = await knex.transaction();

        try {
            const { outlet_id, web_name, outlet_settings_master_id, s_value } = body;

            // Check outlet id exists or not (outlets).
            const existingOutlets = await trx(OUTLETS.NAME)
                .select(OUTLETS.COLUMNS.ID)
                .whereIn(OUTLETS.COLUMNS.ID, outlet_id)
                .andWhere(OUTLETS.COLUMNS.IS_ACTIVE, true)
                .then(rows => rows.map(row => row.id));

            if (existingOutlets.length !== outlet_id.length) {
                const missingIds = outlet_id.filter(id => !existingOutlets.includes(id));
                throw CustomError.create({
                    httpCode: StatusCodes.NOT_FOUND,
                    message: `Outlets with IDs ${missingIds.join(', ')} do not exist or are inactive`,
                    property: 'outlet_id',
                    code: 'NOT_FOUND'
                });
            }

            //  Validate web_name exists in master
            const isWebNameExists = await trx(OUTLET_SETTINGS_MASTER.NAME)
                .select("*")
                .where({
                    [OUTLET_SETTINGS_MASTER.COLUMNS.ID]: outlet_settings_master_id,
                    [OUTLET_SETTINGS_MASTER.COLUMNS.WEB_NAME]: web_name,
                    [OUTLET_SETTINGS_MASTER.COLUMNS.WEB_ACTIVE]: true
                })
                .first();

            if (!isWebNameExists) {
                throw CustomError.create({
                    httpCode: StatusCodes.NOT_FOUND,
                    message: `Web name ${web_name} does not exist in master`,
                    property: 'web_name',
                    code: 'NOT_FOUND'
                });
            }

            //  Check duplicates
            const existing = await trx(OUTLET_SETTINGS.NAME)
                .select(OUTLET_SETTINGS.COLUMNS.OUTLET_ID)
                .whereIn(OUTLET_SETTINGS.COLUMNS.OUTLET_ID, outlet_id)
                .andWhere({
                    [OUTLET_SETTINGS.COLUMNS.WEB_NAME]: web_name
                });

            if (existing.length > 0) {
                const duplicateIds = existing.map(e => e.outlet_id);

                throw CustomError.create({
                    httpCode: StatusCodes.CONFLICT,
                    message: `Duplicate entry for outlet_ids: ${duplicateIds.join(', ')}`,
                    property: 'duplicate',
                    code: 'CONFLICT'
                });
            }

            //  Prepare bulk insert
            const insertData = outlet_id.map(id => ({
                [OUTLET_SETTINGS.COLUMNS.OUTLET_ID]: id,
                [OUTLET_SETTINGS.COLUMNS.OUTLET_SETTINGS_MASTER_ID]: isWebNameExists.id,
                [OUTLET_SETTINGS.COLUMNS.WEB_NAME]: isWebNameExists.web_name,
                [OUTLET_SETTINGS.COLUMNS.S_GROUP]: isWebNameExists.s_group,
                [OUTLET_SETTINGS.COLUMNS.TABLE_NAME]: isWebNameExists.table_name,
                [OUTLET_SETTINGS.COLUMNS.COLUMN_NAME]: isWebNameExists.column_name,
                [OUTLET_SETTINGS.COLUMNS.STATUS]: false,
                [OUTLET_SETTINGS.COLUMNS.S_VALUE]: s_value,
                [OUTLET_SETTINGS.COLUMNS.CREATED_BY]: userDetails.id
            }));

            const query = trx(OUTLET_SETTINGS.NAME)
                .insert(insertData)
                .returning(['id']);

            logQuery({
                logger: fastify.log,
                query,
                context: 'Create Outlet Setting',
                logTrace
            });

            const result = await query;

            if (!result || result.length === 0) {
                throw CustomError.create({
                    httpCode: StatusCodes.NOT_IMPLEMENTED,
                    message: 'Error while creating outlet setting',
                    property: '',
                    code: 'NOT_IMPLEMENTED'
                });
            }

            //  Commit
            await trx.commit();

            return {
                success: true
            };

        } catch (error) {
            // Rollback on failure
            await trx.rollback();

            console.error("Transaction Failed:", error);

            //  Preserve your custom error handling style
            if (error?._code === 404 || error instanceof CustomError) {
                throw error;
            }

            throw CustomError.create({
                httpCode: StatusCodes.INTERNAL_SERVER_ERROR,
                message: "Outlet Setting transaction failed.",
                property: "",
                code: "TRANSACTION_FAILED"
            });
        }
    }

    async function getOutletSettings({ params, query: queryParams, logTrace }) {
        const knex = this;

        const { outlet_settings_master_id } = params;


        const { search = '' } = queryParams;

        const query = knex(OUTLET_SETTINGS.NAME)
            .select([
                `${OUTLET_SETTINGS.NAME}.${OUTLET_SETTINGS.COLUMNS.ID}`,
                `${OUTLET_SETTINGS.NAME}.${OUTLET_SETTINGS.COLUMNS.OUTLET_ID}`,
                `${OUTLETS.NAME}.${OUTLETS.COLUMNS.FULL_NAME} as outlet_name`,
                `${OUTLETS.NAME}.${OUTLETS.COLUMNS.BANK_ID} as store_code`,
                `${REGION.NAME}.${REGION.COLUMNS.REGION_NAME} as region`,
                `${OUTLET_SETTINGS.NAME}.${OUTLET_SETTINGS.COLUMNS.WEB_NAME}`,
                `${OUTLET_SETTINGS.NAME}.${OUTLET_SETTINGS.COLUMNS.S_VALUE} as status`
            ])
            .innerJoin(
                OUTLET_SETTINGS_MASTER.NAME,
                `${OUTLET_SETTINGS.NAME}.${OUTLET_SETTINGS.COLUMNS.WEB_NAME}`,
                `${OUTLET_SETTINGS_MASTER.NAME}.${OUTLET_SETTINGS_MASTER.COLUMNS.WEB_NAME}`
            )
            .innerJoin(OUTLETS.NAME,
                `${OUTLET_SETTINGS.NAME}.${OUTLET_SETTINGS.COLUMNS.OUTLET_ID}`,
                `${OUTLETS.NAME}.${OUTLETS.COLUMNS.ID}`
            )
            .innerJoin(REGION.NAME,
                `${OUTLETS.NAME}.${OUTLETS.COLUMNS.REGION_ID}`,
                `${REGION.NAME}.${REGION.COLUMNS.ID}`
            )
            .where(`${OUTLET_SETTINGS.NAME}.${OUTLET_SETTINGS.COLUMNS.OUTLET_SETTINGS_MASTER_ID}`, outlet_settings_master_id)
            .where(`${OUTLET_SETTINGS_MASTER.NAME}.${OUTLET_SETTINGS_MASTER.COLUMNS.WEB_ACTIVE}`, true)
            .where(`${OUTLETS.NAME}.${OUTLETS.COLUMNS.IS_ACTIVE}`, true)
            .orderBy([
                { column: `${OUTLET_SETTINGS.NAME}.${OUTLET_SETTINGS.COLUMNS.ID}`, order: 'desc' },
            ]);

        if (search) {

            query.andWhere(function () {
                this.where(`${OUTLETS.NAME}.${OUTLETS.COLUMNS.BANK_ID}`, 'ILIKE', `%${search}%`)
                    .orWhere(`${OUTLETS.NAME}.${OUTLETS.COLUMNS.FULL_NAME}`, 'ILIKE', `%${search}%`)
                    .orWhere(`${OUTLET_SETTINGS.NAME}.${OUTLET_SETTINGS.COLUMNS.S_VALUE}`, 'ILIKE', `%${search}%`);
                // .orWhere(`${OUTLET_SETTINGS.NAME}.${OUTLET_SETTINGS.COLUMNS.S_GROUP}`, 'ILIKE', `%${search}%`)
                // .orWhere(`${OUTLET_SETTINGS.NAME}.${OUTLET_SETTINGS.COLUMNS.S_VALUE}`, 'ILIKE', `%${search}%`);
            });
        }

        logQuery({
            logger: fastify.log,
            query,
            context: 'Search Outlet Settings',
            logTrace
        });

        const response = await query;

        if (!response.length) {
            throw CustomError.create({
                httpCode: StatusCodes.NOT_FOUND,
                message: 'Outlet settings not found',
                property: '',
                code: 'NOT_FOUND'
            });
        }

        return response;
    }

    return {
        postOutletSetting,
        getOutletSettings
    };
}

module.exports = outletSettingsRepo;
