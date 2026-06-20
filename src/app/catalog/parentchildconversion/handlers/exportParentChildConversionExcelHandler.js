const parentChildConversionServices = require("../services/parentChildConversionServices");
const excelRepo = require("../../../Excelupload/repository/excelRepo");

function exportParentChildConversionExcelHandler(fastify) {
  const exportParentChildConversionExcel = parentChildConversionServices.exportParentChildConversionExcelService(fastify);
  return async (request, reply) => {
    const { logTrace } = request;
    const data = await exportParentChildConversionExcel({ logTrace });

    const columns = [
      { header: "S.No", key: "sno" },
      { header: "Outlet Name", key: "outlet_name" },
      { header: "Store Code", key: "store_code" },
      { header: "Parent Code", key: "parent_code" },
      { header: "Parent", key: "parent_name" },
      { header: "Child Code", key: "child_code" },
      { header: "Child", key: "child_name" },
      { header: "Quantity", key: "quantity" },
      { header: "Username", key: "username" }
    ];

    const { exportExcel } = excelRepo(fastify);
    const workbook = await exportExcel({ data, columns, sheetName: "Parent Child Conversion" });
    const buffer = await workbook.xlsx.writeBuffer();

    return reply
      .header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
      .header("Content-Disposition", "attachment; filename=parent-child-conversion.xlsx")
      .header("Access-Control-Expose-Headers", "Content-Disposition")
      .send(buffer);
  };
}

module.exports = exportParentChildConversionExcelHandler;
