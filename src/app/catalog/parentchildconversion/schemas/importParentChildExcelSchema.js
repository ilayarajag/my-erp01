const { errorSchemas } = require("../../../commons/schemas/errorSchemas");

const importParentChildExcelSchema = {
  tags: ["Parent Child Conversion"],
  summary: "Import & validate parent child conversion from Excel",
  consumes: ["multipart/form-data"],
  response: {
    200: {
      type: "object",
      properties: {
        message: { type: "string" },
        valid_count: { type: "integer" },
        error_count: { type: "integer" },
        data: {
          type: "array",
          items: {
            type: "object",
            properties: {
              row: { type: "integer" },
              parent_code: { type: "number" },
              parent_name: { type: "string" },
              child_code: { type: "number" },
              child_name: { type: "string" },
              quantity: { type: "number" }
            }
          }
        },
        errors: { type: "array", items: { type: "string" } }
      }
    },
    ...errorSchemas
  }
};

module.exports = importParentChildExcelSchema;
