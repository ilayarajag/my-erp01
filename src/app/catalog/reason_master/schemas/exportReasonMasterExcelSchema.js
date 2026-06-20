const exportReasonMasterExcelSchema = {
  tags: ["Reason Master"],
  summary: "Export Reason Master to Excel",
  headers: { $ref: "request-headers#" },
  response: {
    200: {
      description: "Excel file download",
      type: "string",
      format: "binary"
    }
  }
};

module.exports = exportReasonMasterExcelSchema;
