const INAUGURAL_OFFER = {
    NAME: "inaugural_offer",
    COLUMNS: {
        OUTLET_ID: "outlet_id",
        IO_DATE: "io_date",
        IO_DAYS: "io_days",
        IO_PURCHASE_AMT: "io_purchase_amt",
        IO_DISCOUNT_AMT: "io_discount_amt",
        IO_BONUS_PNT: "io_bonus_pnt",
        STATUS: "status",
        IS_ACTIVE: "is_active",
        CREATED_BY: "created_by",
        UPDATED_BY: "updated_by",
        CREATED_AT: "created_at",
        UPDATED_AT: "updated_at"
    }
};

const INAUGURAL_OFFER_LOGS = {
    NAME: "inaugural_offer_logs",
    COLUMNS: {
        ID: "id",
        OPERATION_NAME: "operation_name",
        OLD_DATA: "old_data",
        NEW_DATA: "new_data",
        USER_ID: "user_id",
        USER_NAME: "user_name",
        OUTLET_ID: "outlet_id",
        CREATED_AT: "created_at",
        UPDATED_AT: "updated_at"
    }
};


const OUTLETS = {
    NAME: "outlets",
    COLUMNS: {
        ID: "id",
        SHORT_NAME: "short_name",
        FULL_NAME: "fullname",
        BANK_ID: "bankid",
        IS_ACTIVE: "is_active"
    }
};


module.exports = {
    INAUGURAL_OFFER,
    INAUGURAL_OFFER_LOGS,
    OUTLETS
};
