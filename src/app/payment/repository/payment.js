const { StatusCodes } = require("http-status-codes");
const { CustomError } = require("../../errorHandler");
const { logQuery } = require("../../commons/helpers");
const axios = require("axios");
const { COUNTER_CART, OUTLET_PAYMENT_LOGS, PAYMENT_PROVIDERS, PAYMENT_PROVIDER_DEVICE_CONFIG } = require("../commons/constants");
const { exists } = require("fs-extra");
const { errorCodes } = require("fastify");

function paymentRepo(fastify) {
  async function getPaymentgateway({
    input: {
      amount,
      billno,
      name,
      mobile,
      users_id,
      is_card,
      counter_no,
      bags,
      is_radio,
      currentDate,
      currentTime,
      cartItems
    },
    pay_type,
    logTrace,
    outlet_id,
    pay_type_id
  }) {
    try {
  
      const knex = this;
      const transactionNumber =
        `B${String(billno).padStart(5, "0")}`;
      console.log("transaction", transactionNumber);
 var response = null;
      const finalAmount =
        cartItems?.cart_net_total || amount;
      const payType = await knex(PAYMENT_PROVIDER_DEVICE_CONFIG.NAME).where(PAYMENT_PROVIDER_DEVICE_CONFIG.COLUMNS.PAYMENT_PROVIDER_ID, pay_type_id).first();
    if (pay_type.toLowerCase() === "pinelabs") {
        const payload = {
          TransactionNumber: transactionNumber,
          SequenceNumber: 1,
          AllowedPaymentMode: is_card, // 10 = UPI ,1- card   
          MerchantStorePosCode:
            payType.terminal_id || "1221258278",
          Amount: String(finalAmount),
          UserID: name || "USER",
          MerchantID:
            Number(payType.merchant_id),
          SecurityToken:
            payType.secret_key,
          IMEI:
            payType.device_serial_no || "ME1002278",
          AutoCancelDurationInMinutes: 5
        };

        console.log("PHONEPE REQUEST", payload);

        var response = await axios.post(
          `${payType.url}/v1/pinelab/UploadBilledTransaction`,
          payload,
          {
            headers: {
              "Content-Type": "application/json"
            }
          }
        );

        console.log(
          "PHONEPE RESPONSE",
          response.data
        );
        if (!response) {
          throw CustomError.create({
            httpCode: StatusCodes.NOT_IMPLEMENTED,
            message: "Error while placing the payments",
            property: "",
            code: "NOT_IMPLEMENTED"
          });
        }
        const reference_id = response.data.PlutusTransactionReferenceID || 1;

        await knex(COUNTER_CART.NAME)
          .update({
            [COUNTER_CART.COLUMNS.REFERENCE_ID]: reference_id,
          })
          .where(COUNTER_CART.COLUMNS.USERS_ID, users_id)
          .andWhere(COUNTER_CART.COLUMNS.OUTLET_ID, outlet_id)
          .andWhere(COUNTER_CART.COLUMNS.COUNTER_NO, counter_no);

        await knex(OUTLET_PAYMENT_LOGS.NAME)
          .insert({
            [OUTLET_PAYMENT_LOGS.COLUMNS.CREATED_BY]: users_id,
            [OUTLET_PAYMENT_LOGS.COLUMNS.REFERENCE_ID]: reference_id,
            [OUTLET_PAYMENT_LOGS.COLUMNS.BILL_NO]: billno,
            [OUTLET_PAYMENT_LOGS.COLUMNS.OUTLET_ID]: outlet_id,
            [OUTLET_PAYMENT_LOGS.COLUMNS.COUNTER_NO]: counter_no,
            [OUTLET_PAYMENT_LOGS.COLUMNS.REQUEST_PAYLOAD]: JSON.stringify(payload),
            [OUTLET_PAYMENT_LOGS.COLUMNS.AMOUNT]: finalAmount,

          });
      }  if (pay_type.toLowerCase() === "paytm") {
        const payload = {
          cid: payType.store_id,
          paytmTid: payType.terminal_id,
          merchantTransactionId: Number(payType.merchant_id),
          transactionAmount: String(finalAmount),

        }
        console.log("paytm", payload);

         response = await axios.post(
          `${payType.url}/api/payment`,
          payload,
          {
            headers: {
              "Content-Type": "application/json"
            }
          }
        );

        console.log(
          "PAYTM RESPONSE",
          response.data
        );
        if (!response) {
          throw CustomError.create({
            httpCode: StatusCodes.NOT_IMPLEMENTED,
            message: "Error while placing the payments",
            property: "",
            code: "NOT_IMPLEMENTED"
          });
        }
        //   const reference_id = response.data.txnId || 1;
        //   await knex(COUNTER_CART.NAME)
        //   .update({
        //     [COUNTER_CART.COLUMNS.REFERENCE_ID]: reference_id,
        //   })
        //   .where(COUNTER_CART.COLUMNS.USERS_ID, users_id)
        //   .andWhere(COUNTER_CART.COLUMNS.OUTLET_ID, outlet_id)
        //   .andWhere(COUNTER_CART.COLUMNS.COUNTER_NO, counter_no);

        // await knex(OUTLET_PAYMENT_LOGS.NAME)
        //   .insert({
        //     [OUTLET_PAYMENT_LOGS.COLUMNS.CREATED_BY]: users_id,
        //     [OUTLET_PAYMENT_LOGS.COLUMNS.REFERENCE_ID]: reference_id,
        //     [OUTLET_PAYMENT_LOGS.COLUMNS.BILL_NO]: billno,
        //     [OUTLET_PAYMENT_LOGS.COLUMNS.OUTLET_ID]: outlet_id,
        //     [OUTLET_PAYMENT_LOGS.COLUMNS.COUNTER_NO]: counter_no,
        //     [OUTLET_PAYMENT_LOGS.COLUMNS.REQUEST_PAYLOAD]: JSON.stringify(payload),
        //     [OUTLET_PAYMENT_LOGS.COLUMNS.AMOUNT]: finalAmount,

        //   });
      }
      return {
        success: true,
        data: response.data
      };

    } catch (error) {
      throw error;
    }
  }

  // async function getPaymentgatewayDetails({
  //   reference_id,users_id,counter_no,outlet_id,
  //   logTrace
  // }) {
  //   try {
  //     const knex = this;
  //     if (!reference_id) {
  //       throw new Error("reference_id is required");
  //     }

  //     const payload = {
  //       MerchantID: Number(process.env.MERCHANT_ID),
  //       SecurityToken: process.env.SECURITY_TOKEN,
  //       IMEI: process.env.IMEI || "ME1002278",
  //       MerchantStorePosCode:
  //         process.env.MERCHANT_STORE_POS_CODE || "1221258278",
  //       PlutusTransactionReferenceID: reference_id
  //     };


  //     const response = await axios.post(
  //       `${process.env.POS_PINE_UPLOAD_URL}/v1/pinelab/GetCloudBasedTxnStatus`,
  //       payload,
  //       {
  //         headers: {
  //           "Content-Type": "application/json"
  //         }
  //       }
  //     );

  //     const responseData = response?.data || {};
  //  const transactionData = response = response?.data.TransactionData || {};
  //     console.log(
  //       "PHONEPE STATUS RESPONSE",
  //       JSON.stringify(responseData, null, 2)
  //     );

  //     if (!responseData) {
  //       throw new Error("No response received from payment gateway");
  //     }

  //     const transactionStatus =
  //       responseData?.ResponseMessage ||
  //       responseData?.TransactionStatus ||
  //       "0";
  //       console.log("dddddddd",transactionData);

  //   await knex(COUNTER_CART.NAME)
  //         .update({
  //           [COUNTER_CART.COLUMNS.REFERENCE_ID]: reference_id,
  //           [COUNTER_CART.COLUMNS.TRANSACTION_STATUS]: transactionData
  //         })
  //         .where(COUNTER_CART.COLUMNS.USERS_ID, users_id)
  //         .andWhere(COUNTER_CART.COLUMNS.OUTLET_ID, outlet_id)
  //         .andWhere(COUNTER_CART.COLUMNS.COUNTER_NO, counter_no);

  //     return {
  //       success: true,
  //       status: transactionStatus,
  //       reference_id,
  //       data: responseData
  //     };
  //   } catch (error) {
  //     console.error(
  //       "PAYMENT STATUS ERROR",
  //       error?.response?.data || error.message
  //     );

  //     return {
  //       success: false,
  //       reference_id,
  //       message: "Unable to fetch payment status",
  //       error:
  //         error?.response?.data ||
  //         error.message ||
  //         "Unknown error"
  //     };
  //   }
  // }
  async function getPaymentgatewayDetails({
    reference_id,
    provider_id,
    pay_type,
    users_id,
    counter_no,
    outlet_id,
    logTrace
  }) {

    try {

      const knex = this;

      if (!reference_id) {
        throw new Error("reference_id is required");
      }
      const payType = await knex(PAYMENT_PROVIDER_DEVICE_CONFIG.NAME).where(PAYMENT_PROVIDER_DEVICE_CONFIG.COLUMNS.PAYMENT_PROVIDER_ID, provider_id).first();
      if (!payType) {
        throw CustomError.create({
          httpCode: StatusCodes.NOT_FOUND,
          message: "Payment provider not found",
          property: "",
          code: "NOT_FOUND"
        });
      }
      if (pay_type == "Pinelabs") {
        const payload = {
          MerchantID: Number(payType.merchant_idD),
          SecurityToken: payType.secret_key,
          IMEI: payType.device_serial_no || "ME1002278",
          MerchantStorePosCode:
            payType.terminal_id || "1221258278",
          PlutusTransactionReferenceID: reference_id
        };

        // console.log(
        //   "PINE LABS STATUS REQUEST",
        //   JSON.stringify(payload, null, 2)
        // );

        const response = await axios.post(
          `${payType.url}/v1/pinelab/GetCloudBasedTxnStatus`,
          payload,
          {
            headers: {
              "Content-Type": "application/json"
            }
          }
        );

        const responseData = response?.data || {};

        const transactionData =
          responseData?.TransactionData || {};

        // console.log(
        //   "PINE LABS STATUS RESPONSE",
        //   JSON.stringify(responseData, null, 2)
        // );

        if (!responseData) {

          throw CustomError.create({
            httpCode: StatusCodes.NOT_FOUND,
            message: "No response received from payment gateway",
            property: "",
            code: "NOT_FOUND"
          });

        }

        const transactionStatus = transactionData || "FAILED";
        await knex(COUNTER_CART.NAME)
          .update({
            [COUNTER_CART.COLUMNS.REFERENCE_ID]: reference_id,
            [COUNTER_CART.COLUMNS.TRANSACTION_STATUS]: JSON.stringify(transactionStatus),
          })
          .where(COUNTER_CART.COLUMNS.USERS_ID, users_id)
          .andWhere(COUNTER_CART.COLUMNS.OUTLET_ID, outlet_id)
          .andWhere(COUNTER_CART.COLUMNS.COUNTER_NO, counter_no);

        await knex(OUTLET_PAYMENT_LOGS.NAME)
          .update({
            [OUTLET_PAYMENT_LOGS.COLUMNS.REFERENCE_ID]: reference_id,
            [OUTLET_PAYMENT_LOGS.COLUMNS.TRANSACTION_STATUS]: JSON.stringify(responseData),
            [OUTLET_PAYMENT_LOGS.COLUMNS.PROVIDER_ID]: provider_id,
            [OUTLET_PAYMENT_LOGS.COLUMNS.UPDATED_AT]: new Date(),
            [OUTLET_PAYMENT_LOGS.COLUMNS.RESPONSE_MESSAGE]: JSON.stringify(responseData),
            [OUTLET_PAYMENT_LOGS.COLUMNS.PAYMENT_STATUS]: "success",
            [OUTLET_PAYMENT_LOGS.COLUMNS.RESPONSE_PAYLOAD]: JSON.stringify(transactionStatus),
            [OUTLET_PAYMENT_LOGS.COLUMNS.RESPONSE_CODE]: responseData.ResponseCode
          })

          .where(OUTLET_PAYMENT_LOGS.COLUMNS.REFERENCE_ID, reference_id)
          .andWhere(OUTLET_PAYMENT_LOGS.COLUMNS.OUTLET_ID, outlet_id)
          .andWhere(OUTLET_PAYMENT_LOGS.COLUMNS.COUNTER_NO, counter_no);
      }
      if (pay_type == "Paytm") {
        const payload = {
          cid: payType.store_id,
          paytmTid: payType.terminal_id,
          merchantTransactionId: Number(payType.merchant_id),
        };

        const response = await axios.post(
          `${payType.url}/api/payment/status`,
          payload,
          {
            headers: {
              "Content-Type": "application/json"
            }
          }
        );

        const responseData = response?.data || {};
        console.log(responseData);
        if (!responseData) {
          throw CustomError.create({
            httpCode: StatusCodes.NOT_FOUND,
            message: "No response received from payment gateway",
            property: "",
            code: "NOT_FOUND"
          });

        }

        const transactionStatus = transactionData || "FAILED";
        await knex(COUNTER_CART.NAME)
          .update({
            [COUNTER_CART.COLUMNS.REFERENCE_ID]: reference_id,
            [COUNTER_CART.COLUMNS.TRANSACTION_STATUS]: JSON.stringify(transactionStatus),
          })
          .where(COUNTER_CART.COLUMNS.USERS_ID, users_id)
          .andWhere(COUNTER_CART.COLUMNS.OUTLET_ID, outlet_id)
          .andWhere(COUNTER_CART.COLUMNS.COUNTER_NO, counter_no);
        await knex(OUTLET_PAYMENT_LOGS.NAME)
          .update({
            [OUTLET_PAYMENT_LOGS.COLUMNS.REFERENCE_ID]: reference_id,
            [OUTLET_PAYMENT_LOGS.COLUMNS.TRANSACTION_STATUS]: JSON.stringify(responseData),
            [OUTLET_PAYMENT_LOGS.COLUMNS.PROVIDER_ID]: provider_id,
            [OUTLET_PAYMENT_LOGS.COLUMNS.UPDATED_AT]: new Date(),
            [OUTLET_PAYMENT_LOGS.COLUMNS.RESPONSE_MESSAGE]: JSON.stringify(responseData),
            [OUTLET_PAYMENT_LOGS.COLUMNS.PAYMENT_STATUS]: "success",
            [OUTLET_PAYMENT_LOGS.COLUMNS.RESPONSE_PAYLOAD]: JSON.stringify(transactionStatus),
            [OUTLET_PAYMENT_LOGS.COLUMNS.RESPONSE_CODE]: responseData.ResponseCode
          })

          .where(OUTLET_PAYMENT_LOGS.COLUMNS.REFERENCE_ID, reference_id)
          .andWhere(OUTLET_PAYMENT_LOGS.COLUMNS.OUTLET_ID, outlet_id)
          .andWhere(OUTLET_PAYMENT_LOGS.COLUMNS.COUNTER_NO, counter_no);
      }
      return {
        success: true,
        reference_id,
        paymentStatus: responseData.ResponseMessage
      };

    } catch (error) {

      console.error(
        "PAYMENT STATUS ERROR",
        error?.response?.data || error.message
      );

      return {
        success: false,
        reference_id,
        message:
          "Unable to fetch payment status",
        error:
          error?.response?.data ||
          error.message ||
          "Unknown error"
      };
    }
  }

  async function cancelPaymentgateway({ reference_id, amount, pay_type_id,
    users_id,
    counter_no,
    outlet_id,
    logTrace

  }) {
    try {

      const knex = this;
      if (!reference_id) {
        throw new Error("reference_id is required");
      }
      const payType = await knex(PAYMENT_PROVIDER_DEVICE_CONFIG.NAME).where(PAYMENT_PROVIDER_DEVICE_CONFIG.COLUMNS.PAYMENT_PROVIDER_ID, pay_type_id).first();

      const payload = {
        MerchantID: Number(payType.merchant_id),
        SecurityToken: payType.secret_key,
        IMEI: payType.device_serial_no || "ME1002278",
        MerchantStorePosCode:
          payType.terminal_id,
        PlutusTransactionReferenceID: reference_id,
        Amount: amount
      };
      console.log(payload);

      const response = await axios.post(
        `${payType.url}/v1/pinelab/CancelTransaction`,
        payload,
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );


      if (response.data.ResponseCode == 0) {
        await knex(OUTLET_PAYMENT_LOGS.NAME)
          .update({
            [OUTLET_PAYMENT_LOGS.COLUMNS.PAYMENT_STATUS]: "cancelled",
            [OUTLET_PAYMENT_LOGS.COLUMNS.RESPONSE_CODE]: response.data.ResponseCode
          })
          .where(OUTLET_PAYMENT_LOGS.COLUMNS.REFERENCE_ID, reference_id)
          .andWhere(OUTLET_PAYMENT_LOGS.COLUMNS.OUTLET_ID, outlet_id)
          .andWhere(OUTLET_PAYMENT_LOGS.COLUMNS.COUNTER_NO, counter_no);

      }
      return {
        success: true,
        response_msg: response.data.ResponseMessage
      };
    }
    catch (error) {

      return {
        success: false,
        message: "Unable to cancel payment",
        error:
          error?.response?.data ||
          error.message ||
          "Unknown error"
      };
    }
  }
  async function getPaymentProvider({

    users_id,
    counter_no,
    pay_type_id,
    logTrace,
    outlet_id
  }) {

    const knex = this;
    const providerConfig = await knex(PAYMENT_PROVIDERS
      .NAME)
      .where(PAYMENT_PROVIDERS.COLUMNS.ID, pay_type_id)
      .andWhere(PAYMENT_PROVIDERS.COLUMNS.COUNTER_NO, counter_no)
      .andWhere(PAYMENT_PROVIDERS.COLUMNS.OUTLET_ID, outlet_id)
      .first();
    console.log("providerConfig", providerConfig);

    if (!providerConfig) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_FOUND,
        message: "Payment provider config not found",
        property: "provider_id",
        code: "PROVIDER_CONFIG_NOT_FOUND"
      });
    }
    return providerConfig;
  }

  return {

    getPaymentgateway,
    getPaymentgatewayDetails,
    cancelPaymentgateway,
    getPaymentProvider
  };
}

module.exports = paymentRepo;
