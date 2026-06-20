const { errorSchemas } = require("../../../commons/schemas/errorSchemas");

const getDeviceTypeSchema = {
  tags: ["DEVICE TYPE"],
  summary: "This API is to get device type list",
  headers: { $ref: "request-headers#" },
  response: {
    200: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "integer" },
          name: { type: "string" }
        }
      }
    },
    ...errorSchemas
  }
};

module.exports = getDeviceTypeSchema;
