const OUTLET_COUNTER_PAYMENT_MODES = {
  NAME: "outlet_counter_payment_modes",
  COLUMNS: {
    ID: "id",
    OUTLET_ID: "outlet_id",
    COUNTER_NO: "counter_no",
    CASH: "cash",
    CARD: "card",
    UPI: "upi",
    IS_ACTIVE: "is_active",
    CREATED_BY: "created_by",
    UPDATED_BY: "updated_by",
    CREATED_AT: "created_at",
    UPDATED_AT: "updated_at"
  }
};

const OUTLETS = {
  NAME: "outlets",
  COLUMNS: {
    ID: "id",
    FULL_NAME: "fullname",
    BANK_ID: "bankid",
    IS_ACTIVE: "is_active"
  }
};

module.exports = { OUTLET_COUNTER_PAYMENT_MODES, OUTLETS };
