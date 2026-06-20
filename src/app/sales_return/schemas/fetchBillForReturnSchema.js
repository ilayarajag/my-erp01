const { type } = require("os");
const { errorSchemas } = require("../../commons/schemas/errorSchemas");

const fetchBillForReturnSchema = {
  tags: ["Sales Return"],
  summary: "Fetch bill master and detail before billwise sales return",
  headers: { $ref: "request-headers#" },

  body: {
    type: "object",
    additionalProperties: false,
    required: ["outlet_id", "bill_ref_no"],
    properties: {
      outlet_id: { type: "integer" },
      bill_ref_no: { type: "string" }
    }
  },

  response: {
    200: {
      type: "object",
      properties: {
        bill: {
          type: "object",
          properties: {
            billno: { type: "integer" },
            outlet_id: { type: "integer" },
            outlet_name: { type: "string" },
            counter_no: { type: "integer" },
            bill_ref_no: { type: "string" },
            financial_year: { type: "string" },
            bill_date: { type: "string", format: "date-time" },

            customer_id: {
              anyOf: [
                { type: "integer" },
                { type: "null" }
              ]
            },
            customer_name: {
              anyOf: [
                { type: "string" },
                { type: "null" }
              ]
            },
            customer_mobile: {
              anyOf: [
                { type: "string" },
                { type: "null" }
              ]
            },

            user_id: { type: "integer" },
            user_name: { type: "string" },

            sub_total_amt: { type: "number" },
            discount: { type: "number" },
            grand_total: { type: "number" },
            gst: { type: "number" },

            bill_cash: { type: "number" },
            bill_card: { type: "number" },
            bill_upi: { type: "number" },

            round_off: { type: "number" }
          }
        },

        items: {
          type: "array",
          items: {
            type: "object",
            properties: {
              product_id: { type: "integer" },
              product_code: { type: "integer" },
              product_name: { type: "string" },
              barcode: { type: "string" },
              mrp: { type: "number" },
              discount_amount: { type: "number" },
              rate: { type: "number" },
              sold_qty: { type: "string" },
              uom_name: { type: "string" },
              gst_per: { type: "number" },
              cess_per: { type: "number" },
              gst_amount: { type: "number" },
              cess_amount: { type: "number" },
              net_amount: { type: "number" },
              bill_date: {
                type: "string",
                format: "date-time"
              },
              returned_qty: { type: "string" },
              available_return_qty: { type: "string" }
            }
          }
        }
      }
    },

    ...errorSchemas
  }
};

module.exports = fetchBillForReturnSchema;