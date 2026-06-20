const { errorSchemas } = require("../../commons/schemas/errorSchemas");

const itemWiseSalesSchema = {
  tags: ["Reports"],
  summary: "Get item-wise sales report filtered by region, outlet, date range and optionally category",
  headers: { $ref: "request-headers#" },
  body: {
    type: "object",
    additionalProperties: false,
    required: ["from_date", "to_date", "region_id", "outlet_id"],
    properties: {
      from_date: { type: "string", format: "date" },
      to_date: { type: "string", format: "date" },
      region_id: { type: "integer" },
      outlet_id: { type: "integer" },
      main_category_id: { type: "integer" }
    }
  },

  //   return {
  //     data,
  //     outlet_name: rows[0].outlet_name,
  //     total_sum: [
  //       {
  //         outlet_name: rows[0].outlet_name,
  //         sqty: data.reduce((a, b) => a + b.sqty[0], 0),
  //         svalue: data.reduce((a, b) => a + b.svalue[0], 0),
  //         gst_value: data.reduce((a, b) => a + b.gst_value[0], 0),
  //         cess_value: data.reduce((a, b) => a + b.cess_value[0], 0)
  //       }
  //     ]
  //   }
  // }
  response: {
    200: {
      type: "object",
      properties: {
        data: {
          type: "array",
          items: {
            type: "object",
            properties: {
              pro_code: { type: "string" },
              product_name: { type: "string" },
              main_category: { type: "string" },
              sub_category: { type: "string" },
              mc_name: { type: "string" },
              brand_name: { type: "string" },
              brand_company_name: { type: "string" },
              hsn: { type: "string" },
              vat: { type: "number" },
              cess: { type: "number" },
              sqty: { type: "array", items: { type: "number" } },
              svalue: { type: "array", items: { type: "number" } },
              gst_value: { type: "array", items: { type: "number" } },
              cess_value: { type: "array", items: { type: "number" } },
              total_qty: { type: "number" },
              total_value: { type: "number" },
              uom_name: { type: "string" }
            }
          }
        },
        outlet_name: { type: "string" },
        total_sum: {
          type: "array",
          items: {
            type: "object",
            properties: {
              outlet_name: { type: "string" },
              sqty: { type: "number" },
              svalue: { type: "number" },
              gst_value: { type: "number" },
              cess_value: { type: "number" }
            }
          }
        }
      }
    },
    ...errorSchemas
  }
};

module.exports = itemWiseSalesSchema;
