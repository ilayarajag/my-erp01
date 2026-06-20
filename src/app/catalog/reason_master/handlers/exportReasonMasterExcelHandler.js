const reasonMasterServices = require("../services/reasonMasterServices");
const excelRepo = require("../../../Excelupload/repository/excelRepo");

function exportReasonMasterExcelHandler(fastify) {
  const exportReasonMasterExcel = reasonMasterServices.exportReasonMasterExcelService(fastify);
  return async (request, reply) => {
    const { logTrace } = request;
    const data = await exportReasonMasterExcel({ logTrace });

    const columns = [
      { header: "Region", key: "region" },
      { header: "Outlet Name", key: "outlet_name" },
      { header: "Store Code", key: "store_code" },
      { header: "Reason", key: "reason" },
      { header: "Reason Name", key: "reason_name" },
      { header: "Active", key: "active" }
    ];

    const { exportExcel } = excelRepo(fastify);
    const workbook = await exportExcel({ data, columns, sheetName: "Reason Master" });
    const buffer = await workbook.xlsx.writeBuffer();

    return reply
      .header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
      .header("Content-Disposition", "attachment; filename=reason-master.xlsx")
      .header("Access-Control-Expose-Headers", "Content-Disposition")
      .send(buffer);
  };
}

module.exports = exportReasonMasterExcelHandler;
