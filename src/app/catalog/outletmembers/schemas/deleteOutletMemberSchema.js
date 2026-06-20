const { errorSchemas } = require("../../../commons/schemas/errorSchemas");

const deleteOutletMemberSchema = {
  tags: ["OUTLET MEMBERS"],
  summary: "This API is to delete outlet member",
  headers: { $ref: "request-headers#" },
  params: {
    type: "object",
    properties: {
      member_id: { type: "integer" }
    }
  },
  response: {
    200: {
      type: "object",
      properties: {
        success: { type: "boolean" }
      }
    },
    ...errorSchemas
  }
};

module.exports = deleteOutletMemberSchema;
