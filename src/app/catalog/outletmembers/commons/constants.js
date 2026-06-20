const OUTLET_MEMBERS = {
    NAME: "outlet_members",
    COLUMNS: {
        ID: "id",
        MOBILE: "mobile",
        PARTY_NAME: "party_name",
        EMAIL:"email",
        GST_IN: "gst_in",
        BALANCE_POINTS: "balance_points",
        WALLET_AMOUNT: "wallet_amount",
        IS_ACTIVE: "is_active",
        CREATED_BY: "created_by",
        UPDATED_BY: "updated_by",
        CREATED_AT: "created_at",
        UPDATED_AT: "updated_at",
        OUTLET_ID:"outlet_id",
        CARD_NO:"card_no",
        ADDRESS:"address",
        CITY:"city",
        PINCODE:"pincode",
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
    IS_ACTIVE: "is_active",
    COMPANY_ID: "company_id",
    CREATED_BY: "created_by",
  }
};

module.exports = {
    OUTLET_MEMBERS,
    OUTLETS
}