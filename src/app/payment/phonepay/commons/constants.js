const OUTLET_PAYMENT_LOGS = {
  NAME: "outlet_payment_logs",
  COLUMNS: {
    ID: "id",
    REFERENCE_ID: "reference_id",
    BILL_NO: "bill_no",
    COUNTER_NO: "counter_no",
    OUTLET_ID: "outlet_id",
    AMOUNT: "amount",
    TRANSACTION_STATUS: "transaction_status",
    RESPONSE_CODE: "response_code",
    RESPONSE_MESSAGE: "response_message",
    CREATED_BY: "created_by",
    PAYMENT_STATUS: "payment_status",
    PROVIDER_ID: "provider_id",
    REQUEST_PAYLOAD: "request_payload",
    RESPONSE_PAYLOAD: "response_payload",
    CREATED_AT: "created_at",
    UPDATED_AT: "updated_at",
    UPDATED_BY: "updated_by",
  }
};


const PAYMENT_PROVIDER_DEVICE_CONFIG = {
  NAME: "payment_provider_device_config",
  COLUMNS: {
    ID: "id",
    PAYMENT_PROVIDER_ID: "payment_provider_id",
    MERCHANT_ID: "merchant_id",
    TERMINAL_ID: "terminal_id",
    STORE_ID: "store_id",
    API_KEY: "api_key",
    SECRET_KEY: "secret_key",
    DEVICE_SERIAL_NO: "device_serial_no",
    CREATED_BY: "created_by",
    UPDATED_BY: "updated_by",
    CREATED_AT: "created_at",
    UPDATED_AT: "updated_at",
  }
};

const PAYMENT_PROVIDER = {
  NAME: "payment_provider",
  COLUMNS: {
    ID: "id",
    OUTLET_ID: "outlet_id",
    COUNTER_NO: "counter_no",
    PAY_TYPE_ID: "pay_type_id",
    PROVIDER_NAME: "provider_name",
    IS_ACTIVE: "is_active",
    CREATED_AT: "created_at",
    UPDATED_AT: "updated_at",
    CREATED_BY: "created_by",
    UPDATED_BY: "updated_by"
  }
};

module.exports = { PAYMENT_PROVIDER, PAYMENT_PROVIDER_DEVICE_CONFIG, OUTLET_PAYMENT_LOGS };
