const { StatusCodes } = require("http-status-codes");
const { CustomError } = require("../../../errorHandler");
const { logQuery } = require("../../../commons/helpers");
const { DEVICE, DEVICE_TYPE } = require("../commons/constants");
const { OUTLETS } = require("../../../sales/commons/constants");


function deviceRepo(fastify) {


  async function getDevice({ logTrace, params }) {
    const knex = this;
    const { outlet_id, counter_no } = params;

    if (!outlet_id && !counter_no) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_ACCEPTABLE,
        message: "Either outlet_id or counter_no is required",
        property: "",
        code: "NOT_ACCEPTABLE"
      });
    }

    //Outlet exists
    const outlet_exists = await knex(OUTLETS.NAME)
      .where(OUTLETS.COLUMNS.ID, outlet_id)
      .where(OUTLETS.COLUMNS.IS_ACTIVE, true)
      .first();

    if (!outlet_exists) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_ACCEPTABLE,
        message: "Outlet Id does not exist",
        property: "",
        code: "NOT_ACCEPTABLE"
      });
    }

    const query = knex(DEVICE.NAME)
      .select(
        `${DEVICE.NAME}.*`, `${DEVICE_TYPE.NAME}.${DEVICE_TYPE.COLUMNS.NAME} as device_type`)
      .innerJoin(DEVICE_TYPE.NAME, `${DEVICE_TYPE.NAME}.${DEVICE_TYPE.COLUMNS.ID}`,
        `${DEVICE.NAME}.${DEVICE.COLUMNS.DEVICE_TYPE_ID}`)
      .where(`${DEVICE.NAME}.${DEVICE.COLUMNS.IS_ACTIVE}`, true)
      .where(`${DEVICE.NAME}.${DEVICE.COLUMNS.OUTLET_ID}`, outlet_id)
      .where(`${DEVICE.NAME}.${DEVICE.COLUMNS.COUNTER_NO}`, counter_no);

    logQuery({
      logger: fastify.log,
      query,
      context: "Get DEVICES",
      logTrace
    });
    const response = await query;
    if (!response.length) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_FOUND,
        message: "DEVICES not found",
        property: "",
        code: "NOT_FOUND"
      });
    }
    return response;
  }

  async function getDeviceInfo({ params, logTrace }) {
    const knex = this;

    const query = knex(DEVICE.NAME)
      .select(
        `${DEVICE.NAME}.*`, `${DEVICE_TYPE.NAME}.${DEVICE_TYPE.COLUMNS.NAME} as device_type`)
      .innerJoin(DEVICE_TYPE.NAME, `${DEVICE_TYPE.NAME}.${DEVICE_TYPE.COLUMNS.ID}`,
        `${DEVICE.NAME}.${DEVICE.COLUMNS.DEVICE_TYPE_ID}`)
      .where(`${DEVICE.NAME}.${DEVICE.COLUMNS.ID}`, params.device_id)
      .andWhere(`${DEVICE.NAME}.${DEVICE.COLUMNS.IS_ACTIVE}`, true);

    logQuery({
      logger: fastify.log,
      query,
      context: "Get Device Info",
      logTrace
    });
    const response = await query;
    if (!response.length) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_FOUND,
        message: "Device not found",
        property: "",
        code: "NOT_FOUND"
      });
    }

    return response[0];

  }

  async function postDevice({ params, body, logTrace, userDetails }) {
    const knex = this;

    //Outlet exists
    const outlet_exists = await knex(OUTLETS.NAME)
      .where(OUTLETS.COLUMNS.ID, body.outlet_id)
      .where(OUTLETS.COLUMNS.IS_ACTIVE, true)
      .first();

    if (!outlet_exists) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_ACCEPTABLE,
        message: "Outlet Id does not exist",
        property: "",
        code: "NOT_ACCEPTABLE"
      });
    }

    // Check if device name already exists
    const exists_response = await knex(DEVICE.NAME)
      .where(DEVICE.COLUMNS.DEVICE_NAME, 'ILIKE', body.device_name)
      .where(DEVICE.COLUMNS.OUTLET_ID, body.outlet_id)
      .where(DEVICE.COLUMNS.COUNTER_NO, body.counter_no)
      .first();

    if (exists_response) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_ACCEPTABLE,
        message: "Device name already exists for the selected outlet and counter",
        property: "",
        code: "NOT_ACCEPTABLE"
      });
    }

    // check given device type id exists or not
    const exists_device_type = await knex(DEVICE_TYPE.NAME)
      .where(DEVICE_TYPE.COLUMNS.ID, body.device_type_id)
      .first();

    if (!exists_device_type) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_ACCEPTABLE,
        message: "Invalid Device Type ID",
        property: "",
        code: "NOT_ACCEPTABLE"
      });
    }

    // Get the next available ID
    const [{ max_id }] = await knex(DEVICE.NAME).max("id as max_id");
    const nextId = (max_id || 0) + 1; //  Get the next ID safely

    // Insert new record with manually incremented ID
    const [query_insert] = await knex(DEVICE.NAME)
      .insert({
        [DEVICE.COLUMNS.ID]: nextId, //  Manually set the next ID
        [DEVICE.COLUMNS.OUTLET_ID]: body.outlet_id,
        [DEVICE.COLUMNS.COUNTER_NO]: body.counter_no,
        [DEVICE.COLUMNS.DEVICE_NAME]: body.device_name,
        [DEVICE.COLUMNS.DEVICE_TYPE_ID]: body.device_type_id,
        [DEVICE.COLUMNS.MODEL]: body.model,
        [DEVICE.COLUMNS.COUNTER_NO]: body.counter_no,
        [DEVICE.COLUMNS.OUTLET_ID]: body.outlet_id,
        [DEVICE.COLUMNS.CONNECTION_TYPE]: body.connection_type,
        [DEVICE.COLUMNS.COM_PORT]: body.com_port,
        [DEVICE.COLUMNS.CREATED_BY]: userDetails.id
      })
      .returning(['id']);

    const insertedHeadsId = query_insert?.id;

    if (!insertedHeadsId) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_IMPLEMENTED,
        message: "Error while creating Device",
        property: "",
        code: "NOT_IMPLEMENTED"
      });
    }

    return { success: true };
  }

  async function putDevice({ device_id, body, logTrace, userDetails }) {
    const knex = this;
    const query = knex(DEVICE.NAME).where(DEVICE.COLUMNS.ID, device_id);

    const exists_response = await query;
    if (!exists_response.length > 0) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_ACCEPTABLE,
        message: "device not found to update",
        property: "",
        code: "NOT_ACCEPTABLE"
      });
    }


    //Outlet exists
    const outlet_exists = await knex(OUTLETS.NAME)
      .where(OUTLETS.COLUMNS.ID, body.outlet_id)
      .where(OUTLETS.COLUMNS.IS_ACTIVE, true)
      .first();

    if (!outlet_exists) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_ACCEPTABLE,
        message: "Outlet Id does not exist",
        property: "",
        code: "NOT_ACCEPTABLE"
      });
    }


    // check given device type id exists or not
    if (body.device_type_id) {
      const exists_device_type = await knex(DEVICE_TYPE.NAME)
        .where(DEVICE_TYPE.COLUMNS.ID, body.device_type_id)
        .first();


      if (!exists_device_type) {
        throw CustomError.create({
          httpCode: StatusCodes.NOT_ACCEPTABLE,
          message: "Invalid Device Type ID",
          property: "",
          code: "NOT_ACCEPTABLE"
        });
      }
    }

    // device name check same outlet id and counter already having 

    if (body.device_name) {
      const device_name_exists = await knex(DEVICE.NAME)
        .where(DEVICE.COLUMNS.DEVICE_NAME, 'ILIKE', body.device_name)
        .where(DEVICE.COLUMNS.OUTLET_ID, body.outlet_id)
        .where(DEVICE.COLUMNS.COUNTER_NO, body.counter_no)
        .whereNot(DEVICE.COLUMNS.ID, device_id)
        .first();

      if (device_name_exists) {
        throw CustomError.create({
          httpCode: StatusCodes.NOT_ACCEPTABLE,
          message: "Device name already exists for the selected outlet and counter",
          property: "",
          code: "NOT_ACCEPTABLE"
        });
      }
    }

    const updateData = {
      [DEVICE.COLUMNS.UPDATED_BY]: userDetails.id,
      [DEVICE.COLUMNS.UPDATED_AT]: knex.fn.now()
    };


    if (body.outlet_id) {
      updateData[DEVICE.COLUMNS.OUTLET_ID] = body.outlet_id;
    }
    if (body.counter_no) {
      updateData[DEVICE.COLUMNS.COUNTER_NO] = body.counter_no;
    }
    if (body.device_name !== undefined) {
      updateData[DEVICE.COLUMNS.DEVICE_NAME] = body.device_name;
    }

    if (body.device_type_id !== undefined) {
      updateData[DEVICE.COLUMNS.DEVICE_TYPE_ID] = body.device_type_id;
    }

    if (body.model !== undefined) {
      updateData[DEVICE.COLUMNS.MODEL] = body.model;
    }

    if (body.connection_type !== undefined) {
      updateData[DEVICE.COLUMNS.CONNECTION_TYPE] = body.connection_type;
    }

    if (body.com_port !== undefined) {
      updateData[DEVICE.COLUMNS.COM_PORT] = body.com_port;
    }

    if (body.is_active !== undefined) {
      updateData[DEVICE.COLUMNS.IS_ACTIVE] = body.is_active ? true : false;
    }

    if (Object.keys(updateData).length <= 2) {
      return { success: true };
    }

    const query_update = await knex(DEVICE.NAME)
      .where(DEVICE.COLUMNS.ID, device_id)
      .update(updateData);

    const response = await query_update;
    if (!response) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_IMPLEMENTED,
        message: "Error while updating device",
        property: "",
        code: "NOT_IMPLEMENTED"
      });
    }

    return { success: true };
  }

  async function deleteDevice({ device_id, body, logTrace, userDetails }) {
    const knex = this;
    const query = knex(DEVICE.NAME).where(DEVICE.COLUMNS.ID, device_id);

    const exists_response = await query;

    if (!exists_response.length > 0) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_ACCEPTABLE,
        message: "Device not found to delete",
        property: "",
        code: "NOT_ACCEPTABLE"
      });
    }

    const query_delete = knex(DEVICE.NAME)
      .where(DEVICE.COLUMNS.ID, device_id)
      .del();

    logQuery({
      logger: fastify.log,
      query,
      context: "delete DEVICE",
      logTrace
    });
    const response = await query_delete;
    if (!response) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_FOUND,
        message: "DEVICE not found",
        property: "",
        code: "NOT_FOUND"
      });
    }

    return { success: true };
  }

  async function getDeviceType({ logTrace }) {
    const knex = this;

    const query = knex(`${DEVICE_TYPE.NAME}`);

    logQuery({
      logger: fastify.log,
      query,
      context: "Get Device Types",
      logTrace
    });
    const response = await query;
    if (!response.length) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_FOUND,
        message: "Device types not found",
        property: "",
        code: "NOT_FOUND"
      });
    }
    return response;
  }




  return {
    getDevice,
    getDeviceInfo,
    postDevice,
    putDevice,
    deleteDevice,
    getDeviceType
  };
}

module.exports = deviceRepo;
