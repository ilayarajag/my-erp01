const getStoreManagerListSchema = require("./getStoreManagerListSchema");
const getStoreManagerInfoSchema = require("./getStoreManagerInfoSchema");
const postStoreManagerSchema = require("./postStoreManagerSchema");
const putStoreManagerSchema = require("./putStoreManagerSchema");
const swapStoreManagerSchema = require("./swapStoreManagerSchema");
const importStoreManagerExcelSchema = require("./importStoreManagerExcelSchema");
const getOutletsByRegionSchema = require("./getOutletsByRegionSchema");
const getStoreManagersByRegionSchema = require("./getStoreManagersByRegionSchema");
const exportStoreManagerExcelSchema = require("./exportStoreManagerExcelSchema");

module.exports = {
  getStoreManagerListSchema,
  getStoreManagerInfoSchema,
  postStoreManagerSchema,
  putStoreManagerSchema,
  swapStoreManagerSchema,
  importStoreManagerExcelSchema,
  getOutletsByRegionSchema,
  getStoreManagersByRegionSchema,
  exportStoreManagerExcelSchema
};
