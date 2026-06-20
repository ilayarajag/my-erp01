const { errorSchemas } = require("../../../commons/schemas/errorSchemas");

const importStoreManagerExcelSchema = {
  tags: ["Store Manager"],
  summary: "Import Store Managers from Excel",
  consumes: ["multipart/form-data"],
  response: {
    200: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        message: { type: "string" },
        total: { type: "integer" },
        data: {
          type: "array",
          items: {
            type: "object",
            properties: {
              store_code: { type: "string" },
              outlet_name: { type: "string" },
              sm_name: { type: "string" },
              sm_mobile: { type: "string" },
            }
          }
        }
      }
    },
    ...errorSchemas
  }

}
module.exports = importStoreManagerExcelSchema;
