const { type } = require("os");
const { errorSchemas } = require("../../commons/schemas/errorSchemas");

const cartPrintsummarySchema = {
  tags: ["CART"],
  summary: "This API is used to get cart print summary.",
  headers: { $ref: "request-headers#" },

  params: {
    type: "object",
    required: ["counter_no", "outlet_id"],
    properties: {
      counter_no: { type: "integer" },
      outlet_id: { type: "integer" },
      bill_no: { type: "integer" },
    }
  },

  response: {
    200: {
      type: "object",
      properties: {

        // SHOP DETAILS
        shop_details: {
          type: "object",
          properties: {
            shop_name: { type: "string" },
            address: { type: "string" },
            city: { type: "string" },
            phone: { type: "string" },
            gstin: { type: "string" },
            fssai_no: { type: "string" }
          }
        },

        // BILL DETAILS
        bill_details: {
          type: "object",
          properties: {
            bill_no: { type: "integer" },
            bill_date: { type: "string" },
            operator_name: { type: "string" },
            customer_mobile : {type: "string"},
            pay_mode : {type: "string"},
            counter_no: { type: "integer" },
            invoice_type: { type: "string" }
          }
        },

        // CART ITEMS
        cart_lines: {
          type: "array",
          items: {
            type: "object",
            properties: {
              sno: { type: "integer" },
              prod_name: { type: "string" },
              hsn: { type: "string" },
              rate: { type: "number" },
              qty: { type: "number" },
              mrp: { type: "number" },
              total_amount: { type: "number" },
              barcode: { type: "string" },
              uom_name: { type: "string" },
              gst: { type: "number" },
            }
          }
        },

        // TOTALS
        totals: {
          type: "object",
          properties: {
            sub_total: { type: "number" },
            roff: { type: "number" },
            total_amount: { type: "number" },
            total_qty: { type: "number" },
            total_bags: { type: "integer" },
            total_sgst: { type: "number" },
            total_cgst: { type: "number" },
            total_gst: { type: "number" }
          }
        },

        payment_details: {
          type: "object",
          properties: {
            pay_mode: { type: "string" },
            paid_amount: { type: "number" },
            balance_amount: { type: "number" }
          }
        },

        // PAYMENT MODES
        payment_mode: {
          type: "array",
          default: [],
          items: {
            type: "object",
            properties: {
              pay_type_id: { type: "integer" },
              outlet_name: { type: "string" },
              counter_no: { type: "integer" },
              pay_type: { type: "string" },

              provider: {
                type: "array",
                default: [],
                items: {
                  type: "object",
                  properties: {
                    provider_id: { type: "integer" },
                    provider_name: { type: "string" }
                  }
                }
              }
            }
          }
        },

        // EXTRA DETAILS
        barcode: { type: "string" },
        whatsapp_number: { type: "string" },
        thank_you_message: { type: "string" }

      }
    },

    ...errorSchemas
  }
};

module.exports = cartPrintsummarySchema;