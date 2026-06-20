const { type } = require("os");
const { errorSchemas } = require("../../../commons/schemas/errorSchemas");

const postDeviceSchema = {
  tags: ["DEVICE"],
  summary: "This API is to post Device",
  headers: { $ref: "request-headers#" },
  body: {
    type: "object",
    required: ["outlet_id", "counter_no", "device_name", "device_type_id", "connection_type", "com_port"],
    properties: {
      outlet_id: { type: "integer" },
      counter_no: { type: "integer" },
      device_name: { type: "string" },
      device_type_id: { type: "integer" },
      model: { type: "string" },
      connection_type: { type: "string" },
      com_port: { type: "string" }
    }
  },
  response: {
    200: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        insert_id: { type: "integer" }
      }
    },
    ...errorSchemas
  }
};

module.exports = postDeviceSchema;
