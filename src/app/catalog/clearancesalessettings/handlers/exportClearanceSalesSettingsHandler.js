const excelRepo = require('../../../Excelupload/repository/excelRepo');
const clearanceSalesSettingsServices = require('../services/clearanceSalesSettingsServices');

function exportClearanceSalesSettingsHandler(fastify) {
  const exportClearanceSalesSettings = clearanceSalesSettingsServices.exportClearanceSalesSettingsService(fastify);

  return async (request, reply) => {
    const { body, logTrace, userDetails } = request;
    const data = await exportClearanceSalesSettings({ body, logTrace, userDetails });

    const columns = [
      { header: "Created On", key: "created_on" },
      { header: "Modified On", key: "modified_on" },
      { header: "User Name", key: "user_name" },
      { header: "Main Category", key: "main_category" },
      { header: "Sub Category", key: "sub_category" },
      { header: "percentage", key: "percentage" }
    ];

    const { exportExcel } = excelRepo(fastify);
    const workbook = await exportExcel({ data, columns, sheetName: "Clearance Sales" });
    const worksheet = workbook.getWorksheet("Clearance Sales");

    worksheet.getColumn("percentage").numFmt = "0.00";
    worksheet.getColumn("created_on").numFmt = "yyyy-mm-dd hh:mm:ss";
    worksheet.getColumn("modified_on").numFmt = "yyyy-mm-dd hh:mm:ss";

    const buffer = await workbook.xlsx.writeBuffer();

    return reply
      .header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
      .header("Content-Disposition", "attachment; filename=clearance-sales.xlsx")
      .header("Access-Control-Expose-Headers", "Content-Disposition")
      .send(buffer);
  };
}

module.exports = exportClearanceSalesSettingsHandler;
