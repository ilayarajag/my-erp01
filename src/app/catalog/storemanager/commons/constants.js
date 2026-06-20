const STORE_MANAGER = {
  NAME: "store_manager",
  COLUMNS: {
    STORE_CODE: "store_code",
    OUTLET_NAME: "outlet_name",
    SM_NAME: "sm_name",
    SM_MOBILE: "sm_mobile",
    CREATED_BY: "created_by",
    UPDATED_BY: "updated_by",
    CREATED_AT: "created_at",
    UPDATED_AT: "updated_at",
    STATUS: "status"
  }
};

const STORE_MANAGER_LOGS = {
  NAME: "store_manager_logs",
  COLUMNS: {
    ID: "id",
    OPERATION_NAME: "operation_name",
    STORE_CODE: "store_code",
    USER_ID: "user_id",
    USER_NAME: "user_name",
    OLD_NAME: "old_name",
    NEW_NAME: "new_name",
    OLD_MOBILE: "old_mobile",
    NEW_MOBILE: "new_mobile",
    CREATED_AT: "created_at"
  }
};

const OUTLETS = {
  NAME: "outlets",
  COLUMNS: {
    ID: "id",
    SHORT_NAME: "short_name",
    FULL_NAME: "fullname",
    BANK_ID: "bankid",
    IS_ACTIVE: "is_active",
    REGION_ID: "region_id",
  }
};

const REGION = {
  NAME: "region",
  COLUMNS: {
    ID: "id",
    REGION_ID: "region_id",
    REGION_NAME: "region_name",
    PREFIX: "prefix"
  }
};

const USERS = {
  NAME: "users",
  COLUMNS: {
    ID: "id",
    USER_NAME: "user_name"
  }
};

module.exports = { STORE_MANAGER, STORE_MANAGER_LOGS, OUTLETS, REGION, USERS };
