const { errorSchemas } = require("../../../commons/schemas/errorSchemas");

const putStoreManagerSchema = {
  tags: ["Store Manager"],
  summary: "Update Store Manager",
  params: {
    type: "object",
    required: ["store_code"],
    properties: {
      store_code: { type: "string" }
    }
  },
  body: {
    type: "object",
    properties: {
      sm_name: { type: "string", maxLength: 60 },
      sm_mobile: { type: "string", maxLength: 12 }
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

module.exports = putStoreManagerSchema;
