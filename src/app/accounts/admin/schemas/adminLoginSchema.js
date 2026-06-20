const { errorSchemas } = require("../../../commons/schemas/errorSchemas");

const adminLoginSchema = {
  tags: ["ADMIN LOGIN"],
  summary: "This API is to login admin users",
  headers: { $ref: "request-headers#" },
  body: {
    type: "object",
    required: ["username", "password"],
    properties: {
      username: { type: "string" },
      password: { type: "string" }
    }
  },
  response: {
    200: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        token: { type: "string" }
      }
    },
    ...errorSchemas
  }
};

module.exports = adminLoginSchema;
