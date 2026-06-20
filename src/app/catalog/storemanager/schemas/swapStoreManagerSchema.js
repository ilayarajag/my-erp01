const { errorSchemas } = require("../../../commons/schemas/errorSchemas");

const swapStoreManagerSchema = {
  tags: ["Store Manager"],
  summary: "Swap Store Managers between two outlets",
  body: {
    type: "object",
    required: ["from_store_code", "to_store_code"],
    properties: {
      from_store_code: { type: "string" },
      to_store_code: { type: "string" }
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

module.exports = swapStoreManagerSchema;
