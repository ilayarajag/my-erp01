const postReasonMasterSchema = require("./postReasonMasterSchema");
const putReasonMasterSchema = require("./putReasonMasterSchema");
const getReasonMasterListSchema = require("./getReasonMasterListSchema");
const getReasonOutletsByRegionSchema = require("./getReasonOutletsByRegionSchema");
const exportReasonMasterExcelSchema = require("./exportReasonMasterExcelSchema");
const getReasonMasterInfoSchema = require("./getReasonMasterInfoSchema");

module.exports = {
  postReasonMasterSchema,
  putReasonMasterSchema,
  getReasonMasterListSchema,
  getReasonMasterInfoSchema,
  getReasonOutletsByRegionSchema,
  exportReasonMasterExcelSchema
};
