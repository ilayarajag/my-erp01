const sedcTransactionInitHandler = require("./sedcTransactionInitHandler");
const edcTransactionStatusHandler = require("./edcTransactionStatusHandler");
const dqrInitHandler = require("./dqrInitHandler");
const cancelPaymentHandler = require("./cancelPaymentHandler");

module.exports = {
  dqrInitHandler,
  sedcTransactionInitHandler,
  edcTransactionStatusHandler,
  cancelPaymentHandler
};
