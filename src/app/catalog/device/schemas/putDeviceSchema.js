const { type } = require("os");
const { errorSchemas } = require("../../../commons/schemas/errorSchemas");

const putDeviceSchema = {
  tags: ["DEVICE"],
  summary: "This API is to update Device",
  headers: { $ref: "request-headers#" },
  params: {
    type: "object",
    properties: {
      device_id: { type: "integer" }
    }
  },
  body: {
    type: "object",
    properties: {
      outlet_id: { type: "integer" },
      counter_no: { type: "integer" },
      device_name: { type: "string" },
      device_type_id: { type: "integer" },
      model: { type: "string" },
      connection_type: { type: "string" },
      com_port: { type: "string" },
      is_active: { type: "boolean" }
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

module.exports = putDeviceSchema;
