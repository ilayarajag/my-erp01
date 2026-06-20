const { errorSchemas } = require("../../commons/schemas/errorSchemas");

const getitemSchema = {
  tags: ["Item"],
  summary: "This API is used to get Item Search details. ",
  headers: { $ref: "request-headers#" },
  params: {
    type: "object",
    properties: {
        page_size: { type: 'string' }, 
        current_page: { type: 'string' }, 
        //search: { type: 'string' },
        
    },
    // required: ['page_size', 'current_page', 'search']
  },
  queryString: {
    type: "object",
    properties: {
        search: { type: 'string' },
        
    }
  },
  response: {
    200: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                prod_code: { type: 'string' },
                prod_id: { type: 'integer' },
                prod_Name: { type: 'string' },
                balance: { type: 'integer' },
                mrp: { type: 'integer' },
                min_stock: { type: 'integer' },
                sales_rate: { type: 'integer' },
                barcode: { type: 'string' },
                purchase_rate: { type: 'integer' },
                out_of_stock: { type: 'string' },
              },
              required: ['prod_code', 'prod_id', 'prod_Name']
            }
          },
          meta: {
            type: 'object',
            properties: {
              pagination: {
                type: 'object',
                properties: {
                  total: { type: 'integer' },
                  page: { type: 'integer' },
                  page_size: { type: 'string' },
                  total_pages: { type: 'integer' }
                },
                required: ['total', 'page', 'page_size', 'total_pages']
              }
            },
            required: ['pagination']
          }
        },
        required: ['data', 'meta']

    },
    ...errorSchemas

}

};

module.exports = getitemSchema;
