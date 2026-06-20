const USERS = {
  NAME: "users",
  COLUMNS: {
    ID: "id",
    USER_NAME: "user_name",
    USER_EMAIL: "user_email",
    USER_MOBILE: "user_mobile",
    USER_PASSWORD: "user_password",
    COMPANY_ID: "company_id",
    USER_TYPE: "user_type",
    IS_ACTIVE: "is_active",
    CREATED_AT: "created_at",
    UPDATED_AT: "updated_at",
    PASSWORD_UPDATED_AT: "password_updated_at",
    LOGIN_UPDATED_AT: "login_updated_at",
    CREATED_BY: "created_by",
    UPDATED_BY: "updated_by",
    IS_LOGGING: "is_logging",
    TIMEZONE: "timezone",
    CURRENCY: "currency"
  }
};
const COMPANY = {
  NAME: "company",
  COLUMNS: {
    ID: "id",
    CODE: "code",
    SHORTNAME: "company_short_name",
    FULLNAME: "company_fullname",
    ADD1: "add1",
    ADD2: "add2",
    ADD3: "add3",
    ADD4: "add4",
    CITY: "city",
    PINCODE: "pincode",
    STATE: "state",
    COUNTRY: "country",
    PHONE: "phone",
    MOBILE: "mobile",
    EMAIL: "email",
    WEBSITE: "website",
    GSTIN: "gstin",
    FSSAI: "fssai",
    SALES_PREFIX: "sales_prefix",
    TRANSFER_PREFIX: "transfer_prefix",
    SALES_RETURN_PREFIX: "fmcg_sales_return_sales_prefix",
    SALES_RETURN_TRANSFER_PREFIX: "fmcg_sales_return_transfer_prefix",
    IS_ACTIVE: "is_active",
    CREATED_AT: "created_at",
    UPDATED_AT: "updated_at",
    CREATED_BY: "created_by",
    UPDATED_BY: "updated_by",
    CURRENCY:"currency"
  }
};

const ROLES = {
  NAME: "roles",
  COLUMNS: {
    ID: "id",
    ROLE_NAME: "role_name",
    COMPANY_ID: "company_id",
    IS_ACTIVE: "is_active",
    CREATED_AT: "created_at",
    UPDATED_AT: "updated_at",
    CREATED_BY: "created_by",
    UPDATED_BY: "updated_by"
  }
};

const ROLE_MAPPING = {
  NAME: "roles_mapping",
  COLUMNS: {
    ID: "id",
    USER_ID: "user_id",
    ROLE_ID: "role_id",
    COMPANY_ID: "company_id",
    IS_OUTLET: "is_outlet",
    IS_WAREHOUSE: "is_warehouse",
    IS_ACTIVE: "is_active",
    CREATED_AT: "created_at",
    UPDATED_AT: "updated_at",
    CREATED_BY: "created_by",
    UPDATED_BY: "updated_by"
  }
};

const COMPANY_USER_MAPPING = {
  NAME: "company_user_mapping",
  COLUMNS: {
    ID: "id",
    USER_ID: "user_id",
    COMPANY_ID: "company_id",
    IS_ACTIVE: "is_active",
    CREATED_AT: "created_at",
    UPDATED_AT: "updated_at",
    CREATED_BY: "created_by",
    UPDATED_BY: "updated_by"
  }
};

const OUTLET_MAPPING = {
  NAME: "outlet_mapping",
  COLUMNS: {
    ID: "id",
    USER_ID: "user_id",
    OUTLET_ID: "outlet_id",
    COMPANY_ID: "company_id",
    IS_ACTIVE: "is_active",
    CREATED_AT: "created_at",
    UPDATED_AT: "updated_at",
    CREATED_BY: "created_by",
    UPDATED_BY: "updated_by"
  }
};

const WAREHOUSE_MAPPING = {
  NAME: "warehouse_mapping",
  COLUMNS: {
    ID: "id",
    USER_ID: "user_id",
    WAREHOUSE_ID: "warehouse_id",
    COMPANY_ID: "company_id",
    IS_ACTIVE: "is_active",
    CREATED_AT: "created_at",
    UPDATED_AT: "updated_at",
    CREATED_BY: "created_by",
    UPDATED_BY: "updated_by"
  }
};

const USERS_LOGS = {
  NAME: "users_logs",
  COLUMNS: {
    ID: "id",
    OPERATION_NAME: "operation_name",
    USER_ID: "user_id",
    CREATE_USER_ID: "createuser_id",
    CREATE_USER_NAME: "createuser_name",
    USER_NAME: "user_name",
    OPERATION_DATE: "operation_date"
  }
};
const MENU_AUTH = {
  NAME: "menu_authorization",
  COLUMNS: {
    ID: "id",
    USER_ID: "user_id",
    MENU_ID: "menu_id",
    ROLE_ID: "role_id",
    SUBMENU_ID: "submenu_id",
    COMPANY_ID: "company_id",
    IS_ACTIVE: "is_active",
    IS_OUTLET: "is_outlet",
    IS_WAREHOUSE: "is_warehouse",
    VIEW: "view",
    SAVE: "save",
    EDIT: "edit",
    DELETE: "delete",
    CREATED_AT: "created_at",
    UPDATED_AT: "updated_at",
    CREATED_BY: "created_by",
    UPDATED_BY: "updated_by"
  }
};


const LOGIN_IPLOGS = {
  NAME: "login_iplogs ",
  COLUMNS: {
    ID: "id",
    USER_ID: "user_id",
    IP_ADDRESS: "ip_address",
    USER_AGENT: "user_agent",
    LOGGED_IN_AT: "logged_in_at",
  }
};
const OUTLETS = {
  NAME: "outlets",
  COLUMNS: {
    ID: "id",
    CODE: "code",
    SHORTNAME: "short_name",
    FULLNAME: "fullname",
    ADD1: "add1",
    ADD2: "add2",
    ADD3: "add3",
    ADD4: "add4",
    CITY_ID: "city_id",
    PINCODE: "pincode",
    STATE_ID: "state_id",
    COUNTRY_ID: "country_id",
    PHONE: "phone",
    MOBILE: "mobile",
    EMAIL: "email",
    WEBSITE: "website",
    GSTIN: "gstin",
    FSSAI: "fssai",
    OUTLETTYPE: "outlet_type",
    BANKACNO: "bankacno",
    BANKID: "bankid",
    BANKNAME: "bankname",
    ACNAME: "acname",
    IFSCCODE: "ifsccode",
    BALANCE: "balance",
    COMPANY_ID: "company_id",
    IS_ACTIVE: "is_active",
    CREATED_AT: "created_at",
    UPDATED_AT: "updated_at",
    CREATED_BY: "created_by",
    UPDATED_BY: "updated_by",
    ISGST: "is_gst",
    FRANCHISETYPE: "franchise_type",
    // BALANCE: "balance",
    CREDIT_LIMIT: "credit_limit",
    LIMITATION: "limitation",
    WALLET_BALANCE: "wallet_balance",
    REF_DOC_NO: "ref_doc_no",
    FOR_INDENT: "for_indent",
    WAREHOUSE_ID: "warehouse_id",
    REGION_ID: "region_id"
  }
};

const OUTLET_PRODUCT_MAPPING = {
  NAME: "outlet_products_mapping",
  COLUMNS: {
    ID: "id",
    PRODUCT_ID: "pro_id",
    PRODUCT_CODE: "pro_code",
    OUTLET_PRODUCT_ID: "outlet_product_id",
    OUTLET_ID: "outlet_id",
    PURCHASE_RATE: "purchase_rate",
    SALES_RATE: "sales_rate",
    MRP: "mrp",
    GST: "gst",
    CESS: "cess",
    OPENING_STOCK: "opening_stock",
    BALENCE_STOCK: "balance_stock",
    HSN: "hsn",
    MBQ: "mbq",
    MBQ_DAYS: "mbqdays",
    PURCHASE_MARGIN: "purchase_margin",
    PACK_QTY: "pack_qty",
    BARCODE: "barcode",
    BARCODE1: "barcode1",
    BARCODE2: "barcode2",
    BARCODE3: "barcode3",
    BARCODE4: "barcode4",
    COMPANY_ID: "company_id",
    SUPPLIER_ID: "supplier_id",
    MIN_STOCK: "min_stock",
    OUTLET_PURCHASE: "outlet_purchase",
    OUTLET_NON_SALEABLE: "outlet_non_saleable",
    LOCAL_OUTLET_PURCHASE: "local_outlet_purchase",
    ALLOW_NEG_STK: "allow_neg_stk",
    WSCALE: "wscale",
    MIN_WARN_STOCK: "min_warn_stock",
    IS_ACTIVE: "is_active",
    SUNDAY: "sunday",
    MONDAY: "monday",
    TUESDAY: "tuesday",
    WEDNESDAY: "wednesday",
    THURSDAY: "thursday",
    FRIDAY: "friday",
    SATURDAY: "saturday",
    CREATED_AT: "created_at",
    UPDATED_AT: "updated_at",
    CREATED_BY: "created_by",
    UPDATED_BY: "updated_by",
    FIXEDMARGIN: "fixedmargin",
    VENDORDISCOUNTTYPE: "vendordiscounttype",
    VENDORDISCOUNTVALUE: "vendordiscountvalue",
    BRAND_COMPANY_ID: "brand_company_id",
    SALES_QTY: "sales_qty",
    STOCK_BALANCE: "stock_balance",
    SALE_DAYS: "sale_days",
    SALES_QTY2: "sales_qty2",
    SALE_DAYS2: "sale_days2"
  }
};

const WAREHOUSE = {
  NAME: "warehouse",
  COLUMNS: {
    ID: "id",
    WAREHOUSE_NAME: "warehouse_name",
    SHORT_NAME: "short_name",
    ADD1: "add1",
    ADD2: "add2",
    ADD3: "add3",
    ADD4: "add4",
    PINCODE: "pincode",
    PHONE: "phone",
    MOBILE: "mobile",
    EMAIL: "email",
    COMPANY_ID: "company_id",
    IS_ACTIVE: "is_active",
    CREATED_AT: "created_at",
    UPDATED_AT: "updated_at",
    CREATED_BY: "created_by",
    UPDATED_BY: "updated_by",
    COUNTRY: "country",
    CITYID: "city_id",
    STATEID: "state_id",
    COUNTRYID: "country_id",
    LIMITATION: "limitation",
    GSTIN: "gstin",
    FSSAI: "fssai",
    ISGST: "is_gst",
    WALLET_BALANCE: "wallet_balance",
    BANKACNO: "bankacno",
    BANKNAME: "bankname",
    ACNAME: "acname",
    IFSCCODE: "ifsccode",
    MAIN_WAREHOUSE: "main_warehouse",
    CONTACT_NAME: "contact_name"
  }
};

const COMPANY_BANK_DETAILS = {
  NAME: "company_bank_details",
  COLUMNS: {
    ID: "id",
    COMPANY_ID: "company_id",
    BANKACNO: "bankacno",
    BANKNAME: "bankname",
    ACNAME: "acname",
    IFSCCODE: "ifsccode",
    IS_ACTIVE: "is_active",
    CREATED_AT: "created_at",
    UPDATED_AT: "updated_at",
    CREATED_BY: "created_by",
    UPDATED_BY: "updated_by"
  }
};
const DEVICES = {
  NAME: "devices",
  COLUMNS: {
    ID: "id",
    DEVICE_NAME: "device_name",
    OUTLET_ID: "outlet_id",
    COUNTER_ID: "counter_id",
    COUNTER_NAME: "counter_name",
    IS_ACTIVE: "is_active",
    CREATED_AT: "created_at",
    UPDATED_AT: "updated_at",
    CREATED_BY: "created_by",
    UPDATED_BY: "updated_by",
    USER_ID: "user_id"
  }
};
const COUNTERSYSTEM = {
  NAME: "counter_system",
  COLUMNS: {
    CNT: "cnt",
    SNAME: "sname"
  }
};

const USER_COUNTER_MAPPING = {
  NAME: "user_counter_mapping",
  COLUMNS: {
    ID: "id",
    USER_ID: "user_id",
    OUTLET_ID: "outlet_id",
    COUNTER_NO: "counter_no",
    COMPANY_ID: "company_id",
    IS_ACTIVE: "is_active",
    CREATED_AT: "created_at",
    UPDATED_AT: "updated_at",
    CREATED_BY: "created_by",
    UPDATED_BY: "updated_by"
  }
};
const COUNTERS_MASTER = {
  NAME: "counters_master",
  COLUMNS: {
    ID: "id",
    COUNTER_NAME: "counter_name",
    COUNTER_NO: "counter_no",
    IS_ACTIVE: "is_active"
  }
};

const COUNTER_SESSION = {
  NAME: "counter_session",
  COLUMNS: {
    ID: "id",
    OUTLET_ID: "outlet_id",
    COUNTER_NO: "counter_no",
    USER_ID: "user_id",
    LOGIN_TIME: "login_time"
  }
};

module.exports = {
  USERS,
  ROLES,
  ROLE_MAPPING,
  OUTLET_MAPPING,
  WAREHOUSE_MAPPING,
  COMPANY_USER_MAPPING,
  USERS_LOGS,
  MENU_AUTH,
  LOGIN_IPLOGS,
  COMPANY,
  OUTLETS,
  OUTLET_PRODUCT_MAPPING,
  WAREHOUSE,
  COMPANY_BANK_DETAILS,
  DEVICES,
  COUNTERSYSTEM,
  USER_COUNTER_MAPPING,
  COUNTERS_MASTER,
  COUNTER_SESSION
};
