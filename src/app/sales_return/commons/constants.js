const SALES_RETURN_MASTER = {
  NAME: "sales_return_master",
  COLUMNS: {
    ID: "id",
    FINANCIAL_YEAR: "financial_year",
    SR_NO: "sr_no",
    OUTLET_ID: "outlet_id",
    SR_DATE: "sr_date",

    BILL_NO: "bill_no",
    ORIGINAL_BILL_DATE: "original_bill_date",
    BILL_REF_NO: "bill_ref_no",

    CUSTOMER_ID: "customer_id",
    CUSTOMER_MOBILE: "customer_mobile",

    SUB_TOTAL_AMOUNT: "sub_total_amount",
    DISCOUNT_AMOUNT: "discount_amount",
    TOTAL_GST_AMOUNT: "total_gst_amount",
    TOTAL_CESS_AMOUNT: "total_cess_amount",
    GRAND_TOTAL: "grand_total",
    ROUND_OFF: "round_off",
    NET_AMOUNT: "net_amount",

    INVOICE_NO: "invoice_no",

    SALES_RETURN_TYPE: "sales_return_type",

    REMARKS: "remarks",

    COUPON_GENERATED: "coupon_generated",
    COUPON_ID: "coupon_id",

    STATUS: "status",

    COMPANY_ID: "company_id",
    USER_NAME: "user_name",
    CREATED_BY: "created_by",
    CREATED_AT: "created_at",
    UPDATED_BY: "updated_by",
    UPDATED_AT: "updated_at"
  }
};

const SALES_RETURN_DETAIL = {
  NAME: "sales_return_detail",
  COLUMNS: {
    ID: "id",
    SALES_RETURN_MST_ID: "sales_return_mst_id",

    FINANCIAL_YEAR: "financial_year",
    BILL_REF_NO: "bill_ref_no",

    PRODUCT_ID: "product_id",
    BATCH_NO: "batch_no",

    DISCOUNT: "discount",
    DISCOUNT_AMOUNT: "discount_amount",

    MRP: "mrp",
    RATE: "rate",

    GST: "gst",
    CGST: "cgst",
    SGST: "sgst",
    GST_AMOUNT: "gst_amount",

    CESS: "cess",
    CESS_AMOUNT: "cess_amount",

    ACTUAL_QTY: "actual_qty",
    RETURN_QTY: "return_qty",

    AMOUNT: "amount",

    COMPANY_ID: "company_id",

    CREATED_BY: "created_by",
    CREATED_AT: "created_at"
  }
};

const SALES_RETURN_COUPON = {
  NAME: "sales_return_coupon",
  COLUMNS: {
    ID: "id",
    COUPON_NO: "coupon_no",
    SALES_RETURN_MST_ID: "sales_return_mst_id",
    ORIGINAL_BILL_NO: "original_bill_no",
    BILL_REF_NO: "bill_ref_no",
    CUSTOMER_ID: "customer_id",
    OUTLET_ID: "outlet_id",
    COUPON_VALUE: "coupon_value",
    BALANCE_AMOUNT: "balance_amount",
    ISSUE_DATE: "issue_date",
    EXPIRY_DATE: "expiry_date",
    STATUS: "status",
    CREATED_AT: "created_at"
  }
};

const SALES_RETURN_COUPON_USAGE = {
  NAME: "sales_return_coupon_usage",
  COLUMNS: {
    ID: "id",
    COUPON_ID: "coupon_id",
    BILL_NO: "bill_no",
    BILL_REF_NO: "bill_ref_no",
    USED_AMOUNT: "used_amount",
    REMAINING_AMOUNT: "remaining_amount",
    OUTLET_ID: "outlet_id",
    USED_AT: "used_at",
    CREATED_BY: "created_by"
  }
};

const STOCK_M_LEDGER = {
  NAME: "stockmledger",
  COLUMNS: {
    ID: "id",
    OUTLET_ID: "outlet_id",
    PRODUCT_ID: "product_id",
    BATCH_NO: "batch_no",
    TRANSACTION_TYPE: "transaction_type",
    SR_NO: "sr_no",
    TRANSACTION_DATE: "transaction_date",
    INWARD_QTY: "inward_qty",
    OUTWARD_QTY: "outward_qty",
    BALANCE_QTY: "balance_qty",
    CREATED_BY: "created_by",
    CREATED_AT: "created_at"
  }
};

const SALES_RETURN_AUDIT = {
  NAME: "sales_return_audit",
  COLUMNS: {
    ID: "id",
    SALES_RETURN_MST_ID: "sales_return_mst_id",
    ACTION_TYPE: "action_type",
    REMARKS: "remarks",
    ACTION_BY: "action_by",
    ACTION_AT: "action_at"
  }
};

const REGION = {
  NAME: "region",
  COLUMNS: {
    ID: "id",
    REGION_NAME: "region_name"
  }
};


module.exports = {
  SALES_RETURN_MASTER,
  SALES_RETURN_DETAIL,
  SALES_RETURN_COUPON,
  SALES_RETURN_COUPON_USAGE,
  STOCK_M_LEDGER,
  SALES_RETURN_AUDIT,
  REGION
};
