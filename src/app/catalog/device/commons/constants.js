const DEVICE = {
    NAME: "device",
    COLUMNS: {
        ID: "id",
        OUTLET_ID:"outlet_id",
        COUNTER_NO:"counter_no",
        DEVICE_NAME: "device_name",
        DEVICE_TYPE_ID: "device_type_id",
        MODEL: "model",
        CONNECTION_TYPE: "connection_type",
        COUNTER_NO: "counter_no",
        OUTLET_ID: "outlet_id",
        COM_PORT: "com_port",
        IS_ACTIVE: "is_active",
        CREATED_BY: "created_by",
        UPDATED_BY: "updated_by",
        CREATED_AT: "created_at",
        UPDATED_AT: "updated_at"
    }
};

const DEVICE_TYPE = {
    NAME: "device_type",
    COLUMNS: {
        ID: "id",
        NAME: "name",
    }
};

module.exports = {
    DEVICE,
    DEVICE_TYPE
}