const { errorSchemas } = require("../../../commons/schemas/errorSchemas");


const exportStoreManagerExcelSchema = {
  tags: ["Store Manager"],
  summary: "Export Store Managers to Excel",
  response: {
    200: {
      description: "Excel file download",
      type: "string",
      format: "binary"
    },
    ...errorSchemas
  }
};

module.exports = exportStoreManagerExcelSchema;
