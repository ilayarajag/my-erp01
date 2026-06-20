const { StatusCodes } = require("http-status-codes");
const { CustomError } = require("../../../errorHandler");
const { logQuery } = require("../../../commons/helpers");
const { OUTLET_SETTINGS_MASTER, OUTLET_SETTINGS_MASTER_LOGS } = require("../commons/constants");

function outletSettingsMstRepo(fastify) {
  async function getOutletSettingsMstList({ query, params, logTrace }) {
    const knex = this;
    const { search } = query;
    const { page_size, current_page } = params;

    const query1 = knex(OUTLET_SETTINGS_MASTER.NAME)
      .select("*")
      .orderBy(OUTLET_SETTINGS_MASTER.COLUMNS.ID, "desc");

    // Apply filters
    if (search && search.length >= 1) {
      query1.where(function () {
        this.where(OUTLET_SETTINGS_MASTER.COLUMNS.WEB_NAME, "ilike", `%${search}%`)
          .orWhere(OUTLET_SETTINGS_MASTER.COLUMNS.S_GROUP, "ilike", `%${search}%`)
          .orWhere(OUTLET_SETTINGS_MASTER.COLUMNS.COLUMN_NAME, "ilike", `%${search}%`)
          .orWhere(OUTLET_SETTINGS_MASTER.COLUMNS.DESCRIPTION, "ilike", `%${search}%`);
      });
    }

    // if (s_group) {
    //   query1.where(OUTLET_SETTINGS_MASTER.COLUMNS.S_GROUP, s_group);
    // }

    // if (web_active) {
    //   query1.where(OUTLET_SETTINGS_MASTER.COLUMNS.WEB_ACTIVE, web_active);
    // }

    // if (daily_update) {
    //   query1.where(OUTLET_SETTINGS_MASTER.COLUMNS.DAILY_UPDATE, daily_update);
    // }

    logQuery({
      logger: fastify.log,
      query: query1,
      context: "Get Outlet Settings List",
      logTrace
    });

    const response = await query1.paginate({
      pageSize: page_size,
      currentPage: current_page
    });

    if (response.meta.pagination.total_pages < current_page) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_ACCEPTABLE,
        message: "Requested page is beyond the available data",
        property: "",
        code: "NOT_ACCEPTABLE"
      });
    }

    if (!response.data.length) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_FOUND,
        message: "Outlet settings not found",
        property: "",
        code: "NOT_FOUND"
      });
    }

    return response;
  }
  async function getOutletSettingsMstActiveList({ query, params, logTrace }) {
    const knex = this;

    const query1 = knex(OUTLET_SETTINGS_MASTER.NAME)
      .select("*")
      .where(OUTLET_SETTINGS_MASTER.COLUMNS.WEB_ACTIVE, true)
      .orderBy(OUTLET_SETTINGS_MASTER.COLUMNS.ID, "desc");

    logQuery({
      logger: fastify.log,
      query: query1,
      context: "Get Outlet Settings List",
      logTrace
    });

    const response = await query1;


    if (!response) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_FOUND,
        message: "Outlet settings not found",
        property: "",
        code: "NOT_FOUND"
      });
    }

    return response;
  }

  async function getOutletSettingsMstInfo({ params, logTrace }) {
    const knex = this;
    const { s_id } = params;

    const query = knex(OUTLET_SETTINGS_MASTER.NAME)
      .select("*")
      .where(OUTLET_SETTINGS_MASTER.COLUMNS.ID, s_id)
      .first();

    logQuery({
      logger: fastify.log,
      query,
      context: "Get Outlet Settings Info",
      logTrace
    });

    const response = await query;

    if (!response) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_FOUND,
        message: "Outlet setting not found",
        property: "",
        code: "NOT_FOUND"
      });
    }

    return response;
  }

  async function createOutletSettingsMst({ body, logTrace, userDetails }) {
    const knex = this;

    // Check if web_name already exists
    const existingSetting = await knex(OUTLET_SETTINGS_MASTER.NAME)
      .where(OUTLET_SETTINGS_MASTER.COLUMNS.WEB_NAME, body.web_name)
      .first();

    if (existingSetting) {
      throw CustomError.create({
        httpCode: StatusCodes.CONFLICT,
        message: "Outlet setting with this web_name already exists",
        property: "web_name",
        code: "CONFLICT"
      });
    }

    const insertData = {
      [OUTLET_SETTINGS_MASTER.COLUMNS.WEB_NAME]: body.web_name,
      [OUTLET_SETTINGS_MASTER.COLUMNS.S_GROUP]: body.s_group,
      [OUTLET_SETTINGS_MASTER.COLUMNS.WEB_ACTIVE]: body.web_active,
      [OUTLET_SETTINGS_MASTER.COLUMNS.DAILY_UPDATE]: body.daily_update,
      [OUTLET_SETTINGS_MASTER.COLUMNS.DATA_TYPE]: body.data_type || 0
    };

    // Add optional fields if provided
    if (body.table_name !== undefined) {
      insertData[OUTLET_SETTINGS_MASTER.COLUMNS.TABLE_NAME] = body.table_name;
    }
    if (body.column_name !== undefined) {
      insertData[OUTLET_SETTINGS_MASTER.COLUMNS.COLUMN_NAME] = body.column_name;
    }
    if (body.description !== undefined) { 
      insertData[OUTLET_SETTINGS_MASTER.COLUMNS.DESCRIPTION] = body.description;
    }

    const query = knex(OUTLET_SETTINGS_MASTER.NAME)
      .insert(insertData)
      .returning("*");

    logQuery({
      logger: fastify.log,
      query,
      context: "Create Outlet Settings",
      logTrace
    });

    const response = await query;

    if (!response) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_IMPLEMENTED,
        message: "Error while creating outlet setting",
        property: "",
        code: "NOT_IMPLEMENTED"
      });
    }
    const new_data = {
      [OUTLET_SETTINGS_MASTER.NAME]: response[0]
    }
    await knex(OUTLET_SETTINGS_MASTER_LOGS.NAME).insert({
      [OUTLET_SETTINGS_MASTER_LOGS.COLUMNS.OPERATION_NAME]: "CREATE",
      [OUTLET_SETTINGS_MASTER_LOGS.COLUMNS.OLD_DATA]: null,
      [OUTLET_SETTINGS_MASTER_LOGS.COLUMNS.NEW_DATA]: JSON.stringify(new_data),
      [OUTLET_SETTINGS_MASTER_LOGS.COLUMNS.USER_ID]: userDetails.id,
      [OUTLET_SETTINGS_MASTER_LOGS.COLUMNS.USER_NAME]: userDetails.user_name,
      [OUTLET_SETTINGS_MASTER_LOGS.COLUMNS.OUTLET_SETTINGS_MASTER_ID]: response[0].id,
      [OUTLET_SETTINGS_MASTER_LOGS.COLUMNS.WEB_NAME]: response[0].web_name,
    });

    return { success: true, insert_id: response[0].id };
  }

  async function updateOutletSettingsMst({ params, body, logTrace, userDetails }) {
    const knex = this;
    const { s_id } = params;

    // Check if record exists
    const existingSetting = await knex(OUTLET_SETTINGS_MASTER.NAME)
      .where(OUTLET_SETTINGS_MASTER.COLUMNS.ID, s_id)
      .first();

    if (!existingSetting) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_FOUND,
        message: "Outlet setting not found",
        property: "",
        code: "NOT_FOUND"
      });
    }

    // Check if web_name is being changed and if it conflicts
    if (body.web_name && body.web_name !== existingSetting.web_name) {
      const conflictingSetting = await knex(OUTLET_SETTINGS_MASTER.NAME)
        .where(OUTLET_SETTINGS_MASTER.COLUMNS.WEB_NAME, body.web_name)
        .whereNot(OUTLET_SETTINGS_MASTER.COLUMNS.ID, s_id)
        .first();

      if (conflictingSetting) {
        throw CustomError.create({
          httpCode: StatusCodes.CONFLICT,
          message: "Outlet setting with this web_name already exists",
          property: "web_name",
          code: "CONFLICT"
        });
      }
    }

    const updateData = {};

    // Only update fields that are provided
    if (body.web_name) {
      updateData[OUTLET_SETTINGS_MASTER.COLUMNS.WEB_NAME] = body.web_name;
    }
    if (body.s_group) {
      updateData[OUTLET_SETTINGS_MASTER.COLUMNS.S_GROUP] = body.s_group;
    }
    if (body.table_name) {
      updateData[OUTLET_SETTINGS_MASTER.COLUMNS.TABLE_NAME] = body.table_name;
    }
    if (body.column_name) {
      updateData[OUTLET_SETTINGS_MASTER.COLUMNS.COLUMN_NAME] = body.column_name;
    }
    if (body.web_active) {
      updateData[OUTLET_SETTINGS_MASTER.COLUMNS.WEB_ACTIVE] = body.web_active;
    }
    if (body.daily_update) {
      updateData[OUTLET_SETTINGS_MASTER.COLUMNS.DAILY_UPDATE] = body.daily_update;
    }
    if (body.data_type) {
      updateData[OUTLET_SETTINGS_MASTER.COLUMNS.DATA_TYPE] = body.data_type || 0;
    }
    if (body.description) {
      updateData[OUTLET_SETTINGS_MASTER.COLUMNS.DESCRIPTION] = body.description;
    }

    // If no fields to update
    if (Object.keys(updateData).length === 0) {
      return { success: true };
    }

    const query = knex(OUTLET_SETTINGS_MASTER.NAME)
      .where(OUTLET_SETTINGS_MASTER.COLUMNS.ID, s_id)
      .update(updateData)
      .returning(["id", "web_name"]);

    logQuery({
      logger: fastify.log,
      query,
      context: "Update Outlet Settings",
      logTrace
    });

    const response = await query;

    if (!response) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_IMPLEMENTED,
        message: "Error while updating outlet setting",
        property: "",
        code: "NOT_IMPLEMENTED"
      });
    }

    const old_data = { [OUTLET_SETTINGS_MASTER.NAME]: existingSetting };
    const updated_data = { "body": body };


    await knex(OUTLET_SETTINGS_MASTER_LOGS.NAME).insert({
      [OUTLET_SETTINGS_MASTER_LOGS.COLUMNS.OPERATION_NAME]: "UPDATE",
      [OUTLET_SETTINGS_MASTER_LOGS.COLUMNS.OLD_DATA]: JSON.stringify(old_data),
      [OUTLET_SETTINGS_MASTER_LOGS.COLUMNS.NEW_DATA]: JSON.stringify(updated_data),
      [OUTLET_SETTINGS_MASTER_LOGS.COLUMNS.USER_ID]: userDetails.id,
      [OUTLET_SETTINGS_MASTER_LOGS.COLUMNS.USER_NAME]: userDetails.user_name,
      [OUTLET_SETTINGS_MASTER_LOGS.COLUMNS.OUTLET_SETTINGS_MASTER_ID]: response[0].id,
      [OUTLET_SETTINGS_MASTER_LOGS.COLUMNS.WEB_NAME]: response[0].web_name,
    });


    return { success: true };
  }

  return {
    getOutletSettingsMstList,
    getOutletSettingsMstActiveList,
    getOutletSettingsMstInfo,
    createOutletSettingsMst,
    updateOutletSettingsMst
  };
}

module.exports = outletSettingsMstRepo;
