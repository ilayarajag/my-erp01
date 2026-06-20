const { StatusCodes } = require("http-status-codes");
const { CustomError } = require("../../../errorHandler");
const { logQuery } = require("../../../commons/helpers");
const { COUNTER_SETTINGS, OUTLETS, PAYMENT_PROVIDERS, PAY_TYPE_MASTER, PAYMENT_PROVIDER_DEVICE_CONFIG } = require("../commons/constants");
const { functionsIn } = require("lodash");


function outletCounterSettingsRepo(fastify) {

  // Shared: validate outlet exists and is active
  async function validateOutlet(knex, outlet_id) {
    const outlet = await knex(OUTLETS.NAME)
      .where(OUTLETS.COLUMNS.ID, outlet_id)
      .where(OUTLETS.COLUMNS.IS_ACTIVE, true)
      .first();
    if (!outlet) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_FOUND,
        message: `Outlet id ${outlet_id} not found or inactive`,
        property: "outlet_id",
        code: "NOT_FOUND"
      });
    }
    return outlet;
  }



  async function getOutletCounterSettings({ userDetails, counter_no, outlet_id, logTrace }) {

    const knex = this;
    const query = knex(COUNTER_SETTINGS.NAME)
      .select([
        `${COUNTER_SETTINGS.NAME}.${COUNTER_SETTINGS.COLUMNS.ID} as pay_type_id`,
        `${COUNTER_SETTINGS.NAME}.${COUNTER_SETTINGS.COLUMNS.OUTLET_ID} as outlet_id`,
        `${COUNTER_SETTINGS.NAME}.${COUNTER_SETTINGS.COLUMNS.COUNTER_NO} as counter_no`,
        `${COUNTER_SETTINGS.NAME}.${COUNTER_SETTINGS.COLUMNS.PAY_TYPE_ID} as pay_type_id`,
        //`${COUNTER_SETTINGS.NAME}.${COUNTER_SETTINGS.COLUMNS.IS_ACTIVE} as is_active`,
        `${OUTLETS.NAME}.${OUTLETS.COLUMNS.FULL_NAME} as outlet_name`,
        //`${OUTLETS.NAME}.${OUTLETS.COLUMNS.BANK_ID} as store_code`
        `${PAY_TYPE_MASTER.NAME}.${PAY_TYPE_MASTER.COLUMNS.PAY_TYPE_NAME} as pay_type`
      ])
      .join(
        OUTLETS.NAME,
        `${COUNTER_SETTINGS.NAME}.${COUNTER_SETTINGS.COLUMNS.OUTLET_ID}`,
        `${OUTLETS.NAME}.${OUTLETS.COLUMNS.ID}`
      )
      .join(
        PAY_TYPE_MASTER.NAME,
        `${COUNTER_SETTINGS.NAME}.${COUNTER_SETTINGS.COLUMNS.PAY_TYPE_ID}`,
        `${PAY_TYPE_MASTER.NAME}.${PAY_TYPE_MASTER.COLUMNS.ID}`
      )
      .orderBy(`${COUNTER_SETTINGS.NAME}.${COUNTER_SETTINGS.COLUMNS.ID}`, "asc");

    if (outlet_id) {
      query.where(`${COUNTER_SETTINGS.NAME}.${COUNTER_SETTINGS.COLUMNS.OUTLET_ID}`, Number(outlet_id))
      query.where(`${COUNTER_SETTINGS.NAME}.${COUNTER_SETTINGS.COLUMNS.IS_ACTIVE}`, true);
    }
    if (counter_no) {
      query.where(`${COUNTER_SETTINGS.NAME}.${COUNTER_SETTINGS.COLUMNS.COUNTER_NO}`, Number(counter_no))
      query.where(`${COUNTER_SETTINGS.NAME}.${COUNTER_SETTINGS.COLUMNS.IS_ACTIVE}`, true);

    }


    logQuery({
      logger: fastify.log,
      query,
      context: "Get Outlet Counter Payment Modes",
      logTrace
    });

    const response = await query;


    if (!response.length) {
      data: []
    }

    return {
      data: response
    };
  }

  async function getOutletCounterPaymentSettings({ userDetails, counter_no, outlet_id, pay_type_id, logTrace }) {

    const knex = this;
    const query = knex(PAYMENT_PROVIDERS.NAME)
      .select([
        `${PAYMENT_PROVIDERS.NAME}.${PAYMENT_PROVIDERS.COLUMNS.ID} as id`,
        `${PAYMENT_PROVIDERS.NAME}.${PAYMENT_PROVIDERS.COLUMNS.OUTLET_ID} as outlet_id`,
        `${PAYMENT_PROVIDERS.NAME}.${PAYMENT_PROVIDERS.COLUMNS.COUNTER_NO} as counter_no`,
        `${PAYMENT_PROVIDERS.NAME}.${PAYMENT_PROVIDERS.COLUMNS.PAY_TYPE_ID} as pay_type_id`,
        `${PAYMENT_PROVIDERS.NAME}.${PAYMENT_PROVIDERS.COLUMNS.PROVIDER_NAME} as provider_name`,
        //`${COUNTER_SETTINGS.NAME}.${COUNTER_SETTINGS.COLUMNS.IS_ACTIVE} as is_active`,
        `${OUTLETS.NAME}.${OUTLETS.COLUMNS.FULL_NAME} as outlet_name`,
      ])
      .join(
        OUTLETS.NAME,
        `${PAYMENT_PROVIDERS.NAME}.${PAYMENT_PROVIDERS.COLUMNS.OUTLET_ID}`,
        `${OUTLETS.NAME}.${OUTLETS.COLUMNS.ID}`
      )
       .andWhere(`${PAYMENT_PROVIDERS.NAME}.${PAYMENT_PROVIDERS.COLUMNS.COUNTER_NO}`, counter_no)
      .andWhere(`${PAYMENT_PROVIDERS.NAME}.${PAYMENT_PROVIDERS.COLUMNS.OUTLET_ID}`, outlet_id)
      .andWhere(`${PAYMENT_PROVIDERS.NAME}.${PAYMENT_PROVIDERS.COLUMNS.PAY_TYPE_ID}`, pay_type_id)
      .andWhere(`${PAYMENT_PROVIDERS.NAME}.${PAYMENT_PROVIDERS.COLUMNS.IS_ACTIVE}`, true)
      .orderBy(`${PAYMENT_PROVIDERS.NAME}.${PAYMENT_PROVIDERS.COLUMNS.ID}`, "asc");

    logQuery({
      logger: fastify.log,
      query,
      context: "Get Outlet Counter Payment Modes",
      logTrace
    });

    const response = await query;
    console.log("res", response);

    if (!response.length) {
      data: []
    }
    const formattedResponse = response.map(item => ({
      id: Number(item.id),
      outlet_id: Number(item.outlet_id),
      counter_no: Number(item.counter_no),
      pay_type_id: Number(item.pay_type_id),
      provider_name: item.provider_name,
      outlet_name: item.outlet_name
    }));
    return {
      data: formattedResponse
    };

  }
  async function putOutletCounterPaymentProvider({ params, body, logTrace, userDetails }) {

    const knex = this;

    const { provider_id, outlet_id } = params;

    const {
      counter_no,
      pay_type_id,
      provider_name,
      is_active,
      config = {}
    } = body;

    // validate provider exists

    const existingProvider = await knex(PAYMENT_PROVIDERS.NAME)
      .where({
        [PAYMENT_PROVIDERS.COLUMNS.ID]: provider_id,
        [PAYMENT_PROVIDERS.COLUMNS.OUTLET_ID]: outlet_id
      })
      .first();

    if (!existingProvider) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_FOUND,
        message: "Payment provider not found",
        property: "provider_id",
        code: "NOT_FOUND"
      });
    }

    await knex.transaction(async trx => {

      // provider update object

      const providerUpdateData = {
        [PAYMENT_PROVIDERS.COLUMNS.UPDATED_BY]: userDetails.id,
        [PAYMENT_PROVIDERS.COLUMNS.UPDATED_AT]: new Date()
      };

      // only update if provided

      if (counter_no) {
        providerUpdateData[PAYMENT_PROVIDERS.COLUMNS.COUNTER_NO] = counter_no;
      }

      if (pay_type_id) {
        providerUpdateData[PAYMENT_PROVIDERS.COLUMNS.PAY_TYPE_ID] = pay_type_id;
      }

      if (provider_name) {
        providerUpdateData[PAYMENT_PROVIDERS.COLUMNS.PROVIDER_NAME] = provider_name;
      }

      if (is_active) {
        providerUpdateData[PAYMENT_PROVIDERS.COLUMNS.IS_ACTIVE] = is_active;
      }

      // update provider

      const providerQuery = trx(PAYMENT_PROVIDERS.NAME)
        .where({ [PAYMENT_PROVIDERS.COLUMNS.ID]: provider_id })
        .update(providerUpdateData);

      logQuery({
        logger: fastify.log,
        query: providerQuery,
        context: "Update Payment Provider",
        logTrace
      });

      await providerQuery;

      // existing config

      const existingConfig =
        await trx(PAYMENT_PROVIDER_DEVICE_CONFIG.NAME)
          .where({
            [PAYMENT_PROVIDER_DEVICE_CONFIG.COLUMNS.PAYMENT_PROVIDER_ID]:
              provider_id
          })
          .first();

      // config update object

      const configData = {
        [PAYMENT_PROVIDER_DEVICE_CONFIG.COLUMNS.UPDATED_BY]:
          userDetails.id,
        [PAYMENT_PROVIDER_DEVICE_CONFIG.COLUMNS.UPDATED_AT]:
          new Date()
      };

      // only assign if field exists

      if (config.store_id) {
        configData[
          PAYMENT_PROVIDER_DEVICE_CONFIG.COLUMNS.STORE_ID
        ] = config.store_id;
      }

      if (config.merchant_id) {
        configData[
          PAYMENT_PROVIDER_DEVICE_CONFIG.COLUMNS.MERCHANT_ID
        ] = config.merchant_id;
      }

      if (config.terminal_id) {
        configData[
          PAYMENT_PROVIDER_DEVICE_CONFIG.COLUMNS.TERMINAL_ID
        ] = config.terminal_id;
      }

      if (config.api_key) {
        configData[
          PAYMENT_PROVIDER_DEVICE_CONFIG.COLUMNS.API_KEY
        ] = config.api_key;
      }

      if (config.secret_key) {
        configData[
          PAYMENT_PROVIDER_DEVICE_CONFIG.COLUMNS.SECRET_KEY
        ] = config.secret_key;
      }

      if (config.device_serial_no) {
        configData[
          PAYMENT_PROVIDER_DEVICE_CONFIG.COLUMNS.DEVICE_SERIAL_NO
        ] = config.device_serial_no;
      }

      // update existing config

      if (existingConfig) {

        if (Object.keys(configData).length > 2) {

          const configQuery =
            trx(PAYMENT_PROVIDER_DEVICE_CONFIG.NAME)
              .where({
                [PAYMENT_PROVIDER_DEVICE_CONFIG.COLUMNS.PAYMENT_PROVIDER_ID]:
                  provider_id
              })
              .update(configData);

          logQuery({
            logger: fastify.log,
            query: configQuery,
            context: "Update Payment Provider Device Config",
            logTrace
          });

          await configQuery;
        }
      }

      // insert new config

      else {

        if (Object.keys(config).length) {

          await trx(PAYMENT_PROVIDER_DEVICE_CONFIG.NAME)
            .insert({

              [PAYMENT_PROVIDER_DEVICE_CONFIG.COLUMNS.PAYMENT_PROVIDER_ID]:
                provider_id,

              ...configData,

              [PAYMENT_PROVIDER_DEVICE_CONFIG.COLUMNS.CREATED_BY]:
                userDetails.id
            });
        }
      }

    });

    return {
      success: true
    };
  }
  async function putOutletCounterSetting({ params, body, logTrace, userDetails }) {
    const knex = this;
    const { pay_type_id, outlet_id } = params;

    const existing = await knex(COUNTER_SETTINGS.NAME)
      .where(COUNTER_SETTINGS.COLUMNS.ID, pay_type_id)
      .andWhere(COUNTER_SETTINGS.COLUMNS.OUTLET_ID, outlet_id)
      .first();
    if (!existing) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_FOUND,
        message: "Record not found",
        property: "id",
        code: "NOT_FOUND"
      });
    }

    const updateData = {
      [COUNTER_SETTINGS.COLUMNS.UPDATED_AT]: new Date(),
      [COUNTER_SETTINGS.COLUMNS.IS_ACTIVE]: body.is_active
    };

    const query = knex(COUNTER_SETTINGS.NAME)
      .where(COUNTER_SETTINGS.COLUMNS.ID, pay_type_id)
      .andWhere(COUNTER_SETTINGS.COLUMNS.OUTLET_ID, outlet_id)
      .update(updateData);


    const updateDatas = {
      [PAYMENT_PROVIDERS.COLUMNS.UPDATED_BY]: userDetails.id,
      [PAYMENT_PROVIDERS.COLUMNS.UPDATED_AT]: new Date(),
      [PAYMENT_PROVIDERS.COLUMNS.IS_ACTIVE]: body.is_active
    };

    const query1 = knex(PAYMENT_PROVIDERS.NAME)
      .where(PAYMENT_PROVIDERS.COLUMNS.PAY_TYPE_ID, pay_type_id)
      .andWhere(PAYMENT_PROVIDERS.COLUMNS.OUTLET_ID, outlet_id)
      .update(updateDatas);

    logQuery({
      logger: fastify.log,
      query,
      context: "Put Outlet Counter Payment Modes",
      logTrace
    });

    await query;
    await query1;
    return { success: true };
  }
  async function postOutletCounterPaymentProvider({ params, body, logTrace, userDetails }) {

    const knex = this;

    const { outlet_id } = params;

    const {
      counter_no,
      pay_type_id,
      provider_name,
      config = {}
    } = body;

    // validate outlet exists

    const outletExists = await knex(OUTLETS.NAME)
      .where({
        [OUTLETS.COLUMNS.ID]: outlet_id,
        [OUTLETS.COLUMNS.IS_ACTIVE]: true
      })
      .first();

    if (!outletExists) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_FOUND,
        message: "Outlet not found",
        code: "OUTLET_NOT_FOUND"
      });
    }

    // create provider

    const [paymentProvider] = await knex(PAYMENT_PROVIDERS.NAME)
      .insert({
        [PAYMENT_PROVIDERS.COLUMNS.OUTLET_ID]: outlet_id,
        [PAYMENT_PROVIDERS.COLUMNS.COUNTER_NO]: counter_no,
        [PAYMENT_PROVIDERS.COLUMNS.PAY_TYPE_ID]: pay_type_id,
        [PAYMENT_PROVIDERS.COLUMNS.PROVIDER_NAME]: provider_name,
        [PAYMENT_PROVIDERS.COLUMNS.IS_ACTIVE]: true,
        [PAYMENT_PROVIDERS.COLUMNS.CREATED_BY]: userDetails.id,
        [PAYMENT_PROVIDERS.COLUMNS.UPDATED_BY]: userDetails.id
      })
      .returning("*");

    // create device config

    await knex(PAYMENT_PROVIDER_DEVICE_CONFIG.NAME)
      .insert({
        [PAYMENT_PROVIDER_DEVICE_CONFIG.COLUMNS.PAYMENT_PROVIDER_ID]: paymentProvider.id,
        [PAYMENT_PROVIDER_DEVICE_CONFIG.COLUMNS.STORE_ID]: config.store_id || null,
        [PAYMENT_PROVIDER_DEVICE_CONFIG.COLUMNS.MERCHANT_ID]: config.merchant_id || null,
        [PAYMENT_PROVIDER_DEVICE_CONFIG.COLUMNS.TERMINAL_ID]: config.terminal_id || null,
        [PAYMENT_PROVIDER_DEVICE_CONFIG.COLUMNS.API_KEY]: config.api_key || null,
        [PAYMENT_PROVIDER_DEVICE_CONFIG.COLUMNS.SECRET_KEY]: config.secret_key || null,
        [PAYMENT_PROVIDER_DEVICE_CONFIG.COLUMNS.DEVICE_SERIAL_NO]: config.device_serial_no || null,
        [PAYMENT_PROVIDER_DEVICE_CONFIG.COLUMNS.CREATED_BY]: userDetails.id,
        [PAYMENT_PROVIDER_DEVICE_CONFIG.COLUMNS.UPDATED_BY]: userDetails.id
      });

    return { success: true };
  }
  return {
    getOutletCounterSettings,
    getOutletCounterPaymentSettings,
    putOutletCounterPaymentProvider,
    putOutletCounterSetting,
    postOutletCounterPaymentProvider
  };
}




module.exports = outletCounterSettingsRepo;
