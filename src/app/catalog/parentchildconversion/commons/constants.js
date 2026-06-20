const PARENT_CHILD_CONVERSION = {
  NAME: "parent_child_conversion",
  COLUMNS: {
    ID: "id",
    PARENT_ID: "parent_id",
    CHILD_ID: "child_id",
    QUANTITY: "quantity",
    CREATED_BY: "created_by",
    UPDATED_BY: "updated_by",
    OUTLET_IDS: "outlet_ids",
    CREATED_AT: "created_at",
    UPDATED_AT: "updated_at",
    DOWN_OUTLET_IDS: "down_outlet_ids",
    DOWN_DT: "down_dt"
  }
};

const PARENT_CHILD_CONVERSION_LOGS = {
  NAME: "parent_child_conversion_logs",
  COLUMNS: {
    ID: "id",
    OPERATION_NAME: "operation_name",
    PARENT_CHILD_CONVERSION_ID: "parent_child_conversion_id",
    OLD_DATA: "old_data",
    NEW_DATA: "new_data",
    USER_ID: "user_id",
    USER_NAME: "user_name",
    CREATED_AT: "created_at",
  }
};

const ITEM = {
  NAME: "item",
  COLUMNS: {
    ID: "id",
    PRODUCT_CODE: "pro_code",
    PRODUCT_NAME: "pro_name",
    IS_ACTIVE: "is_active"
  }
};

const OUTLETS = {
  NAME: "outlets",
  COLUMNS: {
    ID: "id",
    FULL_NAME: "fullname",
    BANK_ID: "bankid",
    IS_ACTIVE: "is_active",
    REGION_ID: "region_id"
  }
};

const REGION = {
  NAME: "region",
  COLUMNS: {
    ID: "id",
    REGION_NAME: "region_name"
  }
};

const USERS = {
  NAME: "users",
  COLUMNS: {
    ID: "id",
    USER_NAME: "user_name"
  }
};

module.exports = { PARENT_CHILD_CONVERSION, PARENT_CHILD_CONVERSION_LOGS, ITEM, OUTLETS, REGION, USERS };
