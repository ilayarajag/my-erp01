const OUTLET_SETTINGS = {
  NAME: 'outlet_settings',
  COLUMNS: {
    ID: 'id',
    OUTLET_ID: 'outlet_id',
    OUTLET_SETTINGS_MASTER_ID: "outlet_settings_master_id",
    WEB_NAME: 'web_name',
    S_GROUP: 's_group',
    TABLE_NAME: 'table_name',
    COLUMN_NAME: 'column_name',
    STATUS: 'status',
    S_VALUE: 's_value',
    CREATED_BY: 'created_by',
    CREATED_AT: 'created_at'
  }
};

const OUTLET_SETTINGS_MASTER = {
  NAME: 'outlet_settings_master',
  COLUMNS: {
    ID: "id",
    WEB_NAME: 'web_name',
    WEB_ACTIVE: 'web_active'
  }
};

const OUTLETS = {
  NAME: "outlets",
  COLUMNS: {
    ID: "id",
    SHORT_NAME: "short_name",
    FULL_NAME: "fullname",
    BANK_ID: "bankid",
    REGION_ID: "region_id",
    IS_ACTIVE: "is_active"
  }
};

const REGION = {
  NAME: "region",
  COLUMNS: {
    ID: "id",
    REGION_NAME: "region_name"
  }
};
module.exports = { OUTLET_SETTINGS, OUTLET_SETTINGS_MASTER, OUTLETS, REGION };
