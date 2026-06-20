const storeManagerServices = require("../services/storeManagerServices");
const excelRepo = require("../../../Excelupload/repository/excelRepo");

function exportStoreManagerExcelHandler(fastify) {
  const exportStoreManagerExcel = storeManagerServices.exportStoreManagerExcelService(fastify);

  return async (request, reply) => {
    const { logTrace } = request;
    const data = await exportStoreManagerExcel({ logTrace });

    const columns = [
      { header: "City Name", key: "city_name" },
      { header: "Store Code", key: "store_code" },
      { header: "Store Name", key: "store_name" },
      { header: "Store Manager Name", key: "sm_name" },
      { header: "Mobile No", key: "sm_mobile" },
      { header: "Username", key: "username" }
    ];

    const { exportExcel } = excelRepo(fastify);
    const workbook = await exportExcel({ data, columns, sheetName: "Store Managers" });
    const buffer = await workbook.xlsx.writeBuffer();

    return reply
      .header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
      .header("Content-Disposition", "attachment; filename=store-managers.xlsx")
      .header("Access-Control-Expose-Headers", "Content-Disposition")
      .send(buffer);
  };
}


module.exports = exportStoreManagerExcelHandler;
