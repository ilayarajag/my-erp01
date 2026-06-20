const exportParentChildConversionExcelSchema = {
  tags: ["Parent Child Conversion"],
  summary: "Export parent child conversion to Excel",
  headers: { $ref: "request-headers#" },
  response: {
    200: {
      description: "Excel file download",
      type: "string",
      format: "binary"
    }
  }
};

module.exports = exportParentChildConversionExcelSchema;
