const importParentChildExcelSchema = require("./importParentChildExcelSchema");
const postParentChildConversionSchema = require("./postParentChildConversionSchema");
const putParentChildConversionSchema = require("./putParentChildConversionSchema");
const getParentChildConversionListSchema = require("./getParentChildConversionListSchema");
const getParentChildConversionInfoSchema = require("./getParentChildConversionInfoSchema");
const exportParentChildConversionExcelSchema = require("./exportParentChildConversionExcelSchema");

module.exports = {
  importParentChildExcelSchema,
  postParentChildConversionSchema,
  putParentChildConversionSchema,
  getParentChildConversionListSchema,
  getParentChildConversionInfoSchema,
  exportParentChildConversionExcelSchema
};
