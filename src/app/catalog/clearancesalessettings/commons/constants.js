
const SUB_CATEGORY = {
  NAME: "sub_category",
  COLUMNS: {
    ID: 'id',
    SUBCATEGORY_NAME: 'subcategory_name',
    CATEGORY_ID: 'category_id',
    IS_ACTIVE: 'is_active',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at',
    COMPANY_ID: 'company_id',
    IS_INSERTED: 'is_inserted',
  }
};

const MAIN_CATEGORY = {
  NAME: "main_category",
  COLUMNS: {
    ID: "id",
    CATEGORY_NAME: "category_name",
    IS_ACTIVE: "is_active",
    CREATED_AT: "created_at",
    UPDATED_AT: "updated_at",
    COMPANY_ID: "company_id",
    IS_INSERTED: "is_inserted",
    CREATED_BY: "created_by",
    UPDATED_BY: "updated_by"
  }
};

const CLEARANCE_SALES_SETTINGS = {
  NAME: "clearance_sales_settings",
  COLUMNS: {
    ID: "id",
    MAIN_CATEGORY_ID: "main_category_id",
    SUB_CATEGORY_ID: "sub_category_id",
    PERCENTAGE: "percentage",
    CREATED_BY: "created_by",
    UPDATED_BY: "updated_by",
    CREATED_AT: "created_at",
    UPDATED_AT: "updated_at",
    DOWN_OUTLET_IDS: "down_outlet_ids"
  }
};

const CLEARANCE_SALES_SETTINGS_LOGS = {
  NAME: "clearance_sales_settings_logs",

  COLUMNS: {
    ID: "id",
    OPERATION_NAME: "operation_name", // CREATE / UPDATE
    OLD_DATA: "old_data",
    NEW_DATA: "new_data",
    USER_ID: "user_id",
    USER_NAME: "user_name",
    CLEARANCE_SALES_SETTINGS_ID: "clearance_sales_settings_id",
    CREATED_AT: "created_at"
  }
};
const USERS = {
  NAME: "users",
  COLUMNS: {
    ID: "id",
    USER_NAME: "user_name"
  }
};

module.exports = { SUB_CATEGORY, MAIN_CATEGORY, CLEARANCE_SALES_SETTINGS, CLEARANCE_SALES_SETTINGS_LOGS, USERS };
