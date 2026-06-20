const { errorSchemas } = require("../../../commons/schemas/errorSchemas");

const getOutletListSchema = {
  tags: ["OUTLET"],
  summary: "This API is to get Outlet (Paginated)",
  headers: { $ref: "request-headers#" },

  queryString: {
    type: "object",
    required: ["search"],
    additionalProperties: false,
    properties: {

      search: { type: "string", default: "" }
    }
  },

  // params: {
  //   type: "object",
  //   properties: {
  //     // page_size: { type: "integer" },
  //     // current_page: { type: "integer" }
  //   }
  // },

  response: {

  200: {
    type: "object",
    properties: {
      data: {
        type: "array",
        items: {
          type: "object",
          properties: {
            outlet_id: { type: "integer" },
            short_name: { type: "string" },
            fullname: { type: "string" },
            code: { type: "string" }
          }
        }
      },
    ...errorSchemas
    }
  }
}
};

module.exports = getOutletListSchema;