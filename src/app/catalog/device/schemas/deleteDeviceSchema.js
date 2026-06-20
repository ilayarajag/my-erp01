const { errorSchemas } = require("../../../commons/schemas/errorSchemas");

const deleteDeviceSchema = {
  tags: ["DEVICE"],
  summary: "This API is to delete device",
  headers: { $ref: "request-headers#" },
  params: {
    type: "object",
    properties: {
      device_id: { type: "integer" }
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

module.exports = deleteDeviceSchema;
