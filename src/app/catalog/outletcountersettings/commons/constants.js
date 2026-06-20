
const COUNTER_SETTINGS = {
  NAME: "counter_setting",
  COLUMNS: {
    ID: "id",
    OUTLET_ID: "outlet_id",
    COUNTER_NO: "counter_no",
    PAY_TYPE_ID: "pay_type_id",
    IS_ACTIVE: "is_active",
    CREATED_AT: "created_at",
    UPDATED_AT: "updated_at"
  }
};

const PAYMENT_PROVIDERS = {
  NAME: "payment_provider",
  COLUMNS: {
    ID: "id",
    COUNTER_NO: "counter_no",
    OUTLET_ID: "outlet_id",
    PROVIDER_NAME: "provider_name",
    PAY_TYPE_ID: "pay_type_id",
    IS_ACTIVE: "is_active",
    CREATED_AT: "created_at",
    UPDATED_AT: "updated_at",
    CREATED_BY: "created_by",
    UPDATED_BY: "updated_by"
  }
}
const OUTLETS = {
  NAME: "outlets",
  COLUMNS: {
    ID: "id",
    FULL_NAME: "fullname",
    BANK_ID: "bankid",
    IS_ACTIVE: "is_active"
  }
};
const PAY_TYPE_MASTER = {
  NAME: "pay_type_master",
  COLUMNS: {
    ID: "id",
    PAY_TYPE_NAME: "pay_type_name",
    PAY_TYPE_KEY: "pay_type_key",
    IS_ACTIVE: "is_active",
    CREATED_AT: "created_at",
    UPDATED_AT: "updated_at",
    CREATED_BY: "created_by",
    UPDATED_BY: "updated_by",
  }
};

const PAYMENT_PROVIDER_DEVICE_CONFIG = {
  NAME: "payment_provider_device_config",
  COLUMNS: {
    ID: "id",
    PAYMENT_PROVIDER_ID: "payment_provider_id",
    STORE_ID: "store_id",
    MERCHANT_ID: "merchant_id",
    TERMINAL_ID: "terminal_id",
    API_KEY: "api_key",
    SECRET_KEY: "secret_key",
    DEVICE_SERIAL_NO: "device_serial_no",
    CREATED_BY: "created_by",
    UPDATED_BY: "updated_by",
    CREATED_AT: "created_at",
    UPDATED_AT: "updated_at"
  }
};

module.exports = { COUNTER_SETTINGS, OUTLETS, PAYMENT_PROVIDERS, PAY_TYPE_MASTER, PAYMENT_PROVIDER_DEVICE_CONFIG };
