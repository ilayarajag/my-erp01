const OUTLET_SETTINGS_MASTER = {
    NAME: "outlet_settings_master",
    COLUMNS: {
        ID: "id",
        WEB_NAME: "web_name",
        S_GROUP: "s_group",
        TABLE_NAME: "table_name",
        COLUMN_NAME: "column_name",
        WEB_ACTIVE: "web_active",
        DAILY_UPDATE: "daily_update",
        DATA_TYPE: "data_type",
        DESCRIPTION: "description"
    }
};

const OUTLET_SETTINGS_MASTER_LOGS = {
    NAME: "outlet_settings_master_logs",
    COLUMNS: {
        ID: "id",
        OPERATION_NAME: "operation_name",
        OLD_DATA: "old_data",
        NEW_DATA: "new_data",
        USER_ID: "user_id",
        USER_NAME: "user_name",
        OUTLET_SETTINGS_MASTER_ID: "outlet_settings_master_id",
        WEB_NAME: "web_name",
        CREATED_AT: "created_at",
        UPDATED_AT: "updated_at"
    }
};


module.exports = {
    OUTLET_SETTINGS_MASTER,
    OUTLET_SETTINGS_MASTER_LOGS
};
