const sedcTransactionInitSchema = require("./sedcTransactionInitSchema");
const edcTransactionStatusSchema = require("./edcTransactionStatusSchema");
const dqrInitSchema = require("./dqrInitSchema");
const cancelPaymentSchema = require("./cancelPaymentSchema");

module.exports = {
  dqrInitSchema,
  sedcTransactionInitSchema,
  edcTransactionStatusSchema,
  cancelPaymentSchema
};
