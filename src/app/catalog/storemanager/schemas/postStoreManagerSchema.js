const { errorSchemas } = require("../../../commons/schemas/errorSchemas");

const postStoreManagerSchema = {
  tags: ["Store Manager"],
  summary: "Create Store Manager",
  body: {
    type: "object",
    required: ["sm_data"], 
    properties: {
      sm_data: {
        type: "array",
        items: {
          type: "object",
          required: ["store_code", "outlet_name", "sm_name", "sm_mobile"],
          properties: {
            store_code: { type: "string" },
            outlet_name: { type: "string" },
            sm_name: { type: "string", maxLength: 60 },
            sm_mobile: { 
              type: "string",
              maxLength: 12,
              pattern: "^[0-9]{10,12}$" // ✅ better validation
            }
          }
        }
      }
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

module.exports = postStoreManagerSchema;