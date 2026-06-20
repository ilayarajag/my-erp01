const REASON_MASTER = {
  NAME: "reason_master",
  COLUMNS: {
    ID: "id",
    REASON: "reason",
    REASON_NAME: "reason_name",
    REASON_TYPE: "reason_type",
    ACTIVE: "active",
    OUTLET_IDS: "outlet_id",
    CREATED_BY: "created_by",
    UPDATED_BY: "updated_by",
    CREATED_AT: "created_at",
    UPDATED_AT: "updated_at",
    DOWN_OUTLET_IDS: "down_outlet_ids",
    DOWN_DATE: "down_date"
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

const REASON_MASTER_LOGS = {
  NAME: "reason_master_logs",
  COLUMNS: {
    ID: "id",
    OPERATION_NAME: "operation_name", // CREATE / UPDATE / DELETE
    REASON_MASTER_ID: "reason_master_id",
    OLD_DATA: "old_data",
    NEW_DATA: "new_data",
    USER_ID: "user_id",
    USER_NAME: "user_name",
    CREATED_AT: "created_at"
  }
};

module.exports = { REASON_MASTER, OUTLETS, REGION, REASON_MASTER_LOGS };
