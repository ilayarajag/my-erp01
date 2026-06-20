const SALESMAN = {
  NAME: "salesman",
  COLUMNS: {
    ID: "id",
    SALESMANCODE: "sales_man_code",
    SALESMANNAME: "sales_man_name",
    SHORT_NAME: "short_name",
    FATHER_NAME: "father_name",
    MOTHER_NAME: "mother_name",
    CODE: "code",
    ADD1: "add1",
    ADD2: "add2",
    ADD3: "add3",
    DOB: "dob",
    SEX: "sex",
    MOBILE: "mobile",
    PHOTO: "photo",
    ID_PROOF: "id_proof",
    PASSBOOK: "passbook",
    COMPANY_ID: "company_id",
    IS_ACTIVE: "is_active",
    CREATED_AT: "created_at",
    UPDATED_AT: "updated_at",
    CREATED_BY: "created_by",
    UPDATED_BY: "updated_by"
  }
};


const SALESMAN_OUTLET_MAPPING = {
  NAME: "salesman_outlet_mapping",
  COLUMNS: {
    ID: "id",
    SALESMAN_ID: "salesman_id",
    OUTLET_ID: "outlet_id",
    COMPANY_ID: "company_id",
    IS_ACTIVE: "is_active",
    CREATED_AT: "created_at",
    UPDATED_AT: "updated_at",
    CREATED_BY: "created_by",
    UPDATED_BY: "updated_by"
  }
};


module.exports = {
    SALESMAN,
    SALESMAN_OUTLET_MAPPING
}