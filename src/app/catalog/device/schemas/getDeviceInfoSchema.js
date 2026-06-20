const { errorSchemas } = require("../../../commons/schemas/errorSchemas");

const getDeviceInfoSchema = {
  tags: ["DEVICE INFO"],
  summary: "This API is to get device Info",
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
        id: { type: "integer" },
        outlet_id: { type: "integer" },
        counter_no: { type: "integer" },
        device_name: { type: "string" },
        device_type_id: { type: "integer" },
        device_type: { type: "string" },
        model: { type: "string" },
        connection_type: { type: "string" },
        com_port: { type: "string" },
        is_active: { type: "boolean" }
      }
    },
    ...errorSchemas
  }
};

module.exports = getDeviceInfoSchema;
