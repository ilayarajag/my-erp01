const getStoreManagerListHandler = require("./getStoreManagerListHandler");
const getStoreManagerInfoHandler = require("./getStoreManagerInfoHandler");
const postStoreManagerHandler = require("./postStoreManagerHandler");
const putStoreManagerHandler = require("./putStoreManagerHandler");
const swapStoreManagerHandler = require("./swapStoreManagerHandler");
const importStoreManagerExcelHandler = require("./importStoreManagerExcelHandler");
const getOutletsByRegionHandler = require("./getOutletsByRegionHandler");
const getStoreManagersByRegionHandler = require("./getStoreManagersByRegionHandler");
const exportStoreManagerExcelHandler = require("./exportStoreManagerExcelHandler");

module.exports = {
  getStoreManagerListHandler,
  getStoreManagerInfoHandler,
  postStoreManagerHandler,
  putStoreManagerHandler,
  swapStoreManagerHandler,
  importStoreManagerExcelHandler,
  getOutletsByRegionHandler,
  getStoreManagersByRegionHandler,
  exportStoreManagerExcelHandler
};
