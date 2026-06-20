const { errorSchemas } = require("../../commons/schemas/errorSchemas");

const getInvoiceSalesReturnDetailsSchema = {
  tags: ["Sales Return Reports"],
  summary: "Item-level details for a specific sales return invoice",
  headers: { $ref: "request-headers#" },
  body: {
    type: "object",
    required: ["from_date", "to_date", "region_id", "outlet_id", "invoice_number"],
    properties: {
      region_id: { type: "integer" },
      outlet_id: { type: "integer" },
      from_date: { type: "string", format: "date" },
      to_date: { type: "string", format: "date" },
      invoice_number: { type: "string" }
    }
  },
  response: {
  200: {
    type: "object",
    properties: {
      outlet_id: { type: "integer" },
      outlet_name: { type: "string" },
      invoice_no: { type: "string" },
      counter_no: { type: "integer" },
      user_name: { type: "string" },
      total_amount: { type: "number" },
      data: {
        type: "array",
        items: {
          type: "object",
          properties: {
            sr_id: { type: "integer" },
            pro_id: { type: "integer" },
            product_code: { type: "string" },
            product_name: { type: "string" },
            outlet_id: { type: "integer" },
            outlet_name: { type: "string" },
            main_category: { type: "string" },
            sub_category: { type: "string" },
            merchant_category_name: { type: "string" },
            brand_name: { type: "string" },
            brand_company_name: { type: "string" },
            gst: { type: "number" },
            cess: { type: "number" },
            mrp: { type: "number" },
            return_qty: { type: "string" },
            uom_name: { type: "string" },
            item_rate: { type: "number" },
            item_amt: { type: "number" },
            item_gst: { type: "number" },
            total_amt: { type: "number" }
          }
        }
      }
    }
  },
  ...errorSchemas
}
};

module.exports = getInvoiceSalesReturnDetailsSchema;
