
const deleteDeviceSchema = require("./deleteDeviceSchema");
const getDeviceInfoSchema = require("./getDeviceInfoSchema");
const getDeviceSchema = require("./getDeviceSchema");
const getDeviceTypeSchema = require("./getDeviceTypeSchema");
const postDeviceSchema = require("./postDeviceSchema");
const putDeviceSchema = require("./putDeviceSchema");

module.exports = {
  getDeviceSchema,
  getDeviceInfoSchema,
  postDeviceSchema,
  putDeviceSchema,
  deleteDeviceSchema,
  getDeviceTypeSchema
};
