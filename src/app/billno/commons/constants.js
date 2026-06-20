const COMPANY = {
    NAME: "company",
    COLUMNS: {
        ID: "id",
        CODE: "code",
        COMPANY_SHORT_NAME: "company_short_name",
        COMPANY_FULLNAME: "company_fullname",
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
        MOBILE: "mobile",
        WEBSITE: "website",
        GSTIN: "gstin",
        FASSI: "fassi",
        IS_ACTIVE: "is_active",
        CREATED_AT: "created_at",
        UPDATED_AT: "updated_at",
        CREATED_BY: "created_by",
        UPDATED_BY: "updated_by",
        BILL_SEQUENCE: "bill_sequence",
        BILL_NO_TYPE: "bill_no_type"
    }
}


const OUTLET_SALES_MASTER = {
    NAME: "outlet_sales_master",
    COLUMNS: {
        ID: "id",
        DOC_NO: "docno",
        DOC_DATE: "docdate",
        OUTLET_ID: "outletid",
        AMOUNT: "amount",
        SUBTOTAL_AMOUNT: "subtotal_amount",
        GST_PER: "gst_per",
        GST_AMT: "gst_amt",
        CESS_PER: "cess_per",
        CESS_AMT: "cess_amt",
        ROFF: "roff",
        IS_CREDIT: "is_credit",
        OUTSTANDING: "outstanding",
        MODE: "mode",
        COMPANY_ID: "company_id",
        MOBILE: "mobile",
        PARTY_NAME: "party_name",
        ADDRESS: "address",
        GST_IN: "gst_in",
        CREATED_AT: "created_at",
        UPDATED_AT: "updated_at",
        CREATED_BY: "created_by",
        UPDATED_BY: "updated_by",
        SALESMAN_ID: "salesman_id",
        LOYALTY_REDEEM: "loyalty_redem",
        LOYALTY_EARNED: "loyalty_earned",
        BALANCE_POINTS: "balance_points",
        RETURN_BILL_NO: "return_billno",
        RETURN_AMOUNT: "return_amount",
        CASH_AMOUNT: "cash_amount",
        CARD_AMOUNT: "card_amount",
        UPI_AMOUNT: "upi_amount",
        TRANSACTION_ID: "transaction_id",
        TRANSACTION_TYPE: "transaction_type",
        TRANSACTION_PROVIDER: "transaction_provider",
        LESS_AMOUNT: "less_amount",
        DISCOUNT_AMOUNT: "discount_amount",
        COUNTER: "counter"
    }
};

module.exports = {
    COMPANY,
    OUTLET_SALES_MASTER
}

