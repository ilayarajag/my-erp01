const postReasonMasterHandler = require("./postReasonMasterHandler");
const putReasonMasterHandler = require("./putReasonMasterHandler");
const getReasonMasterListHandler = require("./getReasonMasterListHandler");
const getReasonOutletsByRegionHandler = require("./getReasonOutletsByRegionHandler");
const exportReasonMasterExcelHandler = require("./exportReasonMasterExcelHandler");
const getReasonMasterInfoHandler = require("./getReasonMasterInfoHandler");

module.exports = {
  postReasonMasterHandler,
  putReasonMasterHandler,
  getReasonMasterListHandler,
  getReasonMasterInfoHandler,
  getReasonOutletsByRegionHandler,
  exportReasonMasterExcelHandler
};
