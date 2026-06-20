const { StatusCodes } = require("http-status-codes");
const { CustomError } = require("../../../errorHandler");
const { logQuery } = require("../../../commons/helpers");
const outletinfoServices = require("../../../catalog/outletmembers/services/outletMembersServices");
const axios = require("axios");
const { OUTLET_PAYMENT_LOGS, PAYMENT_PROVIDER_DEVICE_CONFIG, PAYMENT_PROVIDER } = require("../commons/constants");
const outletMembersRepo = require("../../../catalog/outletmembers/repository/outletMembersRepo");
const { params } = require("../schemas/edcTransactionStatusSchema");


// Helper Functions
const getCurrentDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
};


function phonepayRepo(fastify) {
  // Get Payment Provider Configuration
  async function getPaymentProvider({
    users_id,
    counter_no,
    provider_id,
    logTrace,
    outlet_id
  }) {
    const knex = this;

    if (!provider_id || !counter_no || !outlet_id) {
      throw CustomError.create({
        httpCode: StatusCodes.BAD_REQUEST,
        message: "Missing required parameters: provider_id, counter_no, outlet_id",
        property: "params",
        code: "REQUIRED_PARAMS_MISSING"
      });
    }

    // Query payment provider from database
    const providerConfig = await knex(PAYMENT_PROVIDER.NAME)
      .where(PAYMENT_PROVIDER.COLUMNS.ID, provider_id)
      .andWhere(PAYMENT_PROVIDER.COLUMNS.COUNTER_NO, counter_no)
      .andWhere(PAYMENT_PROVIDER.COLUMNS.OUTLET_ID, outlet_id)
      .first();

    if (!providerConfig) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_FOUND,
        message: `Payment provider config not found for provider_id: ${provider_id}`,
        property: "provider_id",
        code: "PROVIDER_CONFIG_NOT_FOUND"
      });
    }

    return providerConfig;
  }

  // DQR Transaction Init — fetch provider config, call BFF, insert OUTLET_PAYMENT_LOGS row
  async function paymentLinkSms({ input, logTrace, userDetails }) {
    const knex = this;
    // Fetch provider device config
    const { provider_id, counter_no, cartItems, outlet_id, amount, is_card, billno, customer_id } = input;
    const providerConfig = await knex(PAYMENT_PROVIDER_DEVICE_CONFIG.NAME)
      .where(PAYMENT_PROVIDER_DEVICE_CONFIG.COLUMNS.PAYMENT_PROVIDER_ID, provider_id)
      .first();

    if (!providerConfig) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_FOUND,
        message: `Payment provider device config not found for provider_id: ${provider_id}`,
        property: "provider_id",
        code: "PROVIDER_CONFIG_NOT_FOUND"
      });
    }

    const { merchant_id, terminal_id, store_id } = providerConfig;
    // Validate required config fields
    if (!merchant_id) {
      throw CustomError.create({
        httpCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Incomplete provider configuration",
        property: "provider_config",
        code: "PROVIDER_CONFIG_INCOMPLETE"
      });
    }
    const ts = getCurrentDate();
    const merchantTransactionId = Date.now();
    // `TXN-${outlet_id}-${counter_no}-${String(billno).padStart(6, "0")}`;


    // customer_info
    if (!customer_id) {
      throw CustomError.create({
        httpCode: StatusCodes.BAD_REQUEST,
        message: "Customer ID is required",
        property: "customer_id",
        code: "CUSTOMER_ID_REQUIRED"
      });
    }
    const { getOutletMemberInfo } = outletMembersRepo(fastify);

    const getMemberInfo = await getOutletMemberInfo.call(fastify.knexMedical, {
      counter_no,
      outlet_id,
      params: {
        member_id: customer_id
      },
      logTrace,
      userDetails
    });

    const memberInfo = getMemberInfo && getMemberInfo[0] ? getMemberInfo[0] : {};


    if (!memberInfo.mobile) {
      throw CustomError.create({
        httpCode: StatusCodes.BAD_REQUEST,
        message: "Customer phone number is required",
        property: "customer_phone",
        code: "CUSTOMER_PHONE_REQUIRED"
      });
    }
    const payload = {
      transactionId: merchantTransactionId,
      merchantOrderId: merchantTransactionId,
      amount: Number(amount) * 100,
      instrumentType: "MOBILE",
      instrumentReference: "8248524599" || memberInfo.mobile,
      message: "collect for XXX order",
      email: memberInfo.email || "",
      expiresIn: 1800,
      shortName: memberInfo.party_name,
      storeId: store_id || "",
      terminalId: terminal_id || ""
    };


    fastify.log.debug({
      message: "PhonePe Payment Link Init Request",
      logTrace,
      merchant_id,
      amount: amount,
      transactionId: merchantTransactionId
    });

    try {
      const url = `${providerConfig.url}/v1/phonepay/payments/${merchant_id}`;
      const response = await axios.post(url, payload, {
        headers: { "Content-Type": "application/json" },
        timeout: 30000
      });

      fastify.log.debug({
        message: "PhonePe Payment Link Init Response",
        logTrace,
        responseCode: response.status
      });

      if (response.data && response.data.success && response.data.code.toLowerCase() === "success") {

        const transactionId = response.data?.data?.transactionId || merchantTransactionId;

        // Insert PENDING row in database
        const insertQuery = knex(OUTLET_PAYMENT_LOGS.NAME)
          .insert({
            [OUTLET_PAYMENT_LOGS.COLUMNS.REFERENCE_ID]: transactionId,
            [OUTLET_PAYMENT_LOGS.COLUMNS.BILL_NO]: billno,
            [OUTLET_PAYMENT_LOGS.COLUMNS.COUNTER_NO]: counter_no,
            [OUTLET_PAYMENT_LOGS.COLUMNS.OUTLET_ID]: outlet_id,
            [OUTLET_PAYMENT_LOGS.COLUMNS.AMOUNT]: amount,
            [OUTLET_PAYMENT_LOGS.COLUMNS.PROVIDER_ID]: provider_id,
            [OUTLET_PAYMENT_LOGS.COLUMNS.PAYMENT_STATUS]: "pending",
            [OUTLET_PAYMENT_LOGS.COLUMNS.REQUEST_PAYLOAD]: JSON.stringify(payload),
            [OUTLET_PAYMENT_LOGS.COLUMNS.RESPONSE_PAYLOAD]: JSON.stringify(response.data),
            [OUTLET_PAYMENT_LOGS.COLUMNS.CREATED_BY]: userDetails.id,
            [OUTLET_PAYMENT_LOGS.COLUMNS.UPDATED_BY]: userDetails.id,
            [OUTLET_PAYMENT_LOGS.COLUMNS.CREATED_AT]: new Date(),
            [OUTLET_PAYMENT_LOGS.COLUMNS.UPDATED_AT]: new Date()
          })
          .returning("*");

        logQuery({ logger: fastify.log, query: insertQuery, context: "Insert DQR Payment Log", logTrace });

        const [billPaymentRow] = await insertQuery;

        return {
          success: true,
          transaction_ref_no: transactionId,
          amount: amount,
        };
      }
      else {
        throw CustomError.create({
          httpCode: StatusCodes.BAD_GATEWAY,
          message: response.data?.message || "PhonePe Payment Link init failed",
          property: "payment_link_api",
          code: "PHONEPAY_PAYMENT_LINK_INIT_FAILED"
        })
      }
    } catch (error) {
      const errData = error.response?.data || error.message;
      fastify.log.error({
        message: "PhonePe payment link Init Error",
        logTrace,
        error: errData,
        statusCode: error.response?.status
      });

      throw CustomError.create({
        httpCode: error.response?.status || StatusCodes.BAD_GATEWAY,
        message: errData?.message || errData || "PhonePe payment init failed",
        property: "external_api",
        code: "PHONEPAY_PAYMENT_LINK_FAILED"
      });
    }
  }
  // DQR Transaction Init — fetch provider config, call BFF, insert OUTLET_PAYMENT_LOGS row
  async function dqrInit({ input, logTrace, userDetails }) {
    const knex = this;
    // Fetch provider device config
    const { provider_id, counter_no, cartItems, outlet_id, amount, is_card, billno } = input;
    const providerConfig = await knex(PAYMENT_PROVIDER_DEVICE_CONFIG.NAME)
      .where(PAYMENT_PROVIDER_DEVICE_CONFIG.COLUMNS.PAYMENT_PROVIDER_ID, provider_id)
      .first();

    if (!providerConfig) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_FOUND,
        message: `Payment provider device config not found for provider_id: ${provider_id}`,
        property: "provider_id",
        code: "PROVIDER_CONFIG_NOT_FOUND"
      });
    }

    const { merchant_id, terminal_id, store_id } = providerConfig;
    // Validate required config fields
    if (!merchant_id || !terminal_id || !store_id) {
      throw CustomError.create({
        httpCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Incomplete provider configuration",
        property: "provider_config",
        code: "PROVIDER_CONFIG_INCOMPLETE"
      });
    }
    const ts = getCurrentDate();
    const merchantTransactionId = Date.now();
    // `TXN-${outlet_id}-${counter_no}-${String(billno).padStart(6, "0")}`;

    const payload = {
      transactionId: merchantTransactionId,
      merchantOrderId: merchantTransactionId,
      amount: Number(Number(amount) * 100),
      storeId: String(store_id),
      terminalId: terminal_id,
      expiresIn: 1800
    };

    fastify.log.debug({
      message: "PhonePe DQR Init Request",
      logTrace,
      merchant_id,
      amount: amount,
      transactionId: merchantTransactionId
    });

    try {
      const url = `${providerConfig.url}/v1/phonepay/static/qrcode/generate/${merchant_id}`;
      const response = await axios.post(url, payload, {
        headers: { "Content-Type": "application/json" },
        timeout: 30000
      });

      fastify.log.debug({
        message: "PhonePe DQR Init Response",
        logTrace,
        responseCode: response.status
      });

      if (response.data && response.data.success && response.data.code.toLowerCase() === "success") {

        const transactionId = response.data?.data?.transactionId || merchantTransactionId;

        // Insert PENDING row in database
        const insertQuery = knex(OUTLET_PAYMENT_LOGS.NAME)
          .insert({
            [OUTLET_PAYMENT_LOGS.COLUMNS.REFERENCE_ID]: transactionId,
            [OUTLET_PAYMENT_LOGS.COLUMNS.BILL_NO]: billno,
            [OUTLET_PAYMENT_LOGS.COLUMNS.COUNTER_NO]: counter_no,
            [OUTLET_PAYMENT_LOGS.COLUMNS.OUTLET_ID]: outlet_id,
            [OUTLET_PAYMENT_LOGS.COLUMNS.AMOUNT]: amount,
            [OUTLET_PAYMENT_LOGS.COLUMNS.PROVIDER_ID]: provider_id,
            [OUTLET_PAYMENT_LOGS.COLUMNS.PAYMENT_STATUS]: "pending",
            [OUTLET_PAYMENT_LOGS.COLUMNS.REQUEST_PAYLOAD]: JSON.stringify(payload),
            [OUTLET_PAYMENT_LOGS.COLUMNS.RESPONSE_PAYLOAD]: JSON.stringify(response.data),
            [OUTLET_PAYMENT_LOGS.COLUMNS.CREATED_BY]: userDetails.id,
            [OUTLET_PAYMENT_LOGS.COLUMNS.UPDATED_BY]: userDetails.id,
            [OUTLET_PAYMENT_LOGS.COLUMNS.CREATED_AT]: new Date(),
            [OUTLET_PAYMENT_LOGS.COLUMNS.UPDATED_AT]: new Date()
          })
          .returning("*");

        logQuery({ logger: fastify.log, query: insertQuery, context: "Insert DQR Payment Log", logTrace });

        const [billPaymentRow] = await insertQuery;

        return {
          success: true,
          transaction_ref_no: transactionId,
          amount: amount,
          qrString: response.data.data.qrString
        };
      }
      else {
        throw CustomError.create({
          httpCode: StatusCodes.BAD_GATEWAY,
          message: response.data?.message || "PhonePe DQR init failed",
          property: "dqr_init_api",
          code: "PHONEPAY_DQR_INIT_FAILED"
        })
      }
    } catch (error) {
      const errData = error.response?.data || error.message;
      fastify.log.error({
        message: "PhonePe DQR Init Error",
        logTrace,
        error: errData,
        statusCode: error.response?.status
      });

      throw CustomError.create({
        httpCode: error.response?.status || StatusCodes.BAD_GATEWAY,
        message: errData?.message || errData || "PhonePe DQR init failed",
        property: "external_api",
        code: "PHONEPAY_DQR_INIT_FAILED"
      });
    }
  }

  // SEDC Transaction Init — fetch provider config, call BFF, insert OUTLET_PAYMENT_LOGS row
  async function sedcTransactionInit({ input, logTrace, userDetails }) {
    const knex = this;

    const { provider_id, counter_no, cartItems, outlet_id, amount, is_card, billno } = input;

    // Fetch provider device config
    const providerConfig = await knex(PAYMENT_PROVIDER_DEVICE_CONFIG.NAME)
      .where(PAYMENT_PROVIDER_DEVICE_CONFIG.COLUMNS.PAYMENT_PROVIDER_ID, provider_id)
      .first();

    if (!providerConfig) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_FOUND,
        message: `Payment provider device config not found for provider_id: ${provider_id}`,
        property: "provider_id",
        code: "PROVIDER_CONFIG_NOT_FOUND"
      });
    }

    const isCardPayment = is_card === "yes" ? true : false;
    const { merchant_id, terminal_id, store_id } = providerConfig;
    // Validate required config fields
    if (!merchant_id || !terminal_id || !store_id) {
      throw CustomError.create({
        httpCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Incomplete provider configuration",
        property: "provider_config",
        code: "PROVIDER_CONFIG_INCOMPLETE"
      });
    }
    const merchantTransactionId = `TXN-${outlet_id}-${counter_no}-${String(billno).padStart(6, "0")}`;

    const payload = {
      merchantId: merchant_id,
      merchantTransactionId,
      storeId: String(store_id),
      orderId: merchantTransactionId,
      terminalId: terminal_id,
      amount: amount,
      solutionType: "EDC",
      paymentModes: isCardPayment ? ["CARD"] : ["DQR"],
      timeAllowedForHandoverToTerminalSeconds: 60,
      integrationMappingType: "ONE_TO_ONE"
    };

    fastify.log.debug({
      message: "PhonePe SEDC Init Request",
      logTrace,
      merchant_id,
      amount: amount,
      transactionId: merchantTransactionId
    });

    try {
      const url = `${providerConfig.url}/stage/edc/transaction/init/${merchant_id}`;
      const response = await axios.post(url, payload, {
        headers: { "Content-Type": "application/json" },
        timeout: 30000
      });

      fastify.log.debug({
        message: "PhonePe SEDC Init Response",
        logTrace,
        responseCode: response.status
      });

      // Insert PENDING row in database
      const insertQuery = knex(OUTLET_PAYMENT_LOGS.NAME)
        .insert({
          [OUTLET_PAYMENT_LOGS.COLUMNS.REFERENCE_ID]: merchantTransactionId,
          [OUTLET_PAYMENT_LOGS.COLUMNS.BILL_NO]: billno,
          [OUTLET_PAYMENT_LOGS.COLUMNS.COUNTER_NO]: counter_no,
          [OUTLET_PAYMENT_LOGS.COLUMNS.OUTLET_ID]: outlet_id,
          [OUTLET_PAYMENT_LOGS.COLUMNS.AMOUNT]: amount,
          [OUTLET_PAYMENT_LOGS.COLUMNS.PROVIDER_ID]: provider_id,
          [OUTLET_PAYMENT_LOGS.COLUMNS.PAYMENT_STATUS]: "pending",
          [OUTLET_PAYMENT_LOGS.COLUMNS.REQUEST_PAYLOAD]: JSON.stringify(payload),
          [OUTLET_PAYMENT_LOGS.COLUMNS.RESPONSE_PAYLOAD]: JSON.stringify(response.data),
          [OUTLET_PAYMENT_LOGS.COLUMNS.CREATED_BY]: userDetails.id,
          [OUTLET_PAYMENT_LOGS.COLUMNS.UPDATED_BY]: userDetails.id,
          [OUTLET_PAYMENT_LOGS.COLUMNS.CREATED_AT]: new Date(),
          [OUTLET_PAYMENT_LOGS.COLUMNS.UPDATED_AT]: new Date()
        })
        .returning("*");

      logQuery({ logger: fastify.log, query: insertQuery, context: "Insert SEDC Payment Log", logTrace });

      const [billPaymentRow] = await insertQuery;

      return {
        transaction_ref_no: merchantTransactionId,
        bill_payment_id: billPaymentRow?.id,
        data: response.data
      };
    } catch (error) {
      const errData = error.response?.data || error.message;
      fastify.log.error({
        message: "PhonePe SEDC Init Error",
        logTrace,
        error: errData,
        statusCode: error.response?.status
      });

      throw CustomError.create({
        httpCode: error.response?.status || StatusCodes.BAD_GATEWAY,
        message: errData?.message || errData || "PhonePe SEDC init failed",
        property: "external_api",
        code: "PHONEPAY_SEDC_INIT_FAILED"
      });
    }
  }

  // EDC Transaction Status — call BFF, update OUTLET_PAYMENT_LOGS status
  async function edcTransactionStatus({ params, logTrace, userDetails }) {
    const knex = this;
    const { transactionId } = params;

    if (!transactionId) {
      throw CustomError.create({
        httpCode: StatusCodes.BAD_REQUEST,
        message: "Transaction ID is required",
        property: "transactionId",
        code: "TRANSACTION_ID_REQUIRED"
      });
    }

    // Fetch existing bill payment row
    const billPayment = await knex(OUTLET_PAYMENT_LOGS.NAME)
      .where(OUTLET_PAYMENT_LOGS.COLUMNS.REFERENCE_ID, transactionId)
      .first();

    if (!billPayment) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_FOUND,
        message: `Transaction payment record not found for id: ${transactionId}`,
        property: "transactionId",
        code: "TRANSACTION_NOT_FOUND"
      });
    }

    // Fetch provider config via provider_id on the bill payment row
    const providerConfig = await knex(PAYMENT_PROVIDER_DEVICE_CONFIG.NAME)
      .where(PAYMENT_PROVIDER_DEVICE_CONFIG.COLUMNS.PAYMENT_PROVIDER_ID, billPayment.provider_id)
      .first();

    if (!providerConfig) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_FOUND,
        message: "Payment provider config not found",
        property: "provider_id",
        code: "PROVIDER_CONFIG_NOT_FOUND"
      });
    }

    const { merchant_id } = providerConfig;
    const bill_payment_id = billPayment[OUTLET_PAYMENT_LOGS.COLUMNS.ID];

    fastify.log.debug({
      message: "PhonePe EDC Status Request",
      logTrace,
      merchant_id,
      transactionId
    });

    try {
      const url = `${providerConfig.url}/v1/phonepay/payment/status/${merchant_id}/${transactionId}`;
      const response = await axios.get(url, {
        headers: { "Content-Type": "application/json" },
        timeout: 30000
      });

      fastify.log.debug({
        message: "PhonePe EDC Status Response",
        logTrace,
        responseCode: response.status
      });

      // Map BFF response status to our status
      const bffStatus = response.data?.data?.paymentState || "";
      let paymentStatus = "pending";

      if (["COMPLETED", "SUCCESS", "PAYMENT_SUCCESS"].includes(bffStatus.toUpperCase())) {
        paymentStatus = "success";
      } else if (["FAILED", "PAYMENT_FAILED", "DECLINED", "ERROR"].includes(bffStatus.toUpperCase())) {
        paymentStatus = "failed";
      }

      // Update OUTLET_PAYMENT_LOGS
      const updateQuery = knex(OUTLET_PAYMENT_LOGS.NAME)
        .where(OUTLET_PAYMENT_LOGS.COLUMNS.ID, bill_payment_id)
        .update({
          [OUTLET_PAYMENT_LOGS.COLUMNS.PAYMENT_STATUS]: paymentStatus,
          [OUTLET_PAYMENT_LOGS.COLUMNS.TRANSACTION_STATUS]: JSON.stringify(response.data),
          [OUTLET_PAYMENT_LOGS.COLUMNS.UPDATED_BY]: userDetails.id,
          [OUTLET_PAYMENT_LOGS.COLUMNS.UPDATED_AT]: new Date()
        });

      logQuery({ logger: fastify.log, query: updateQuery, context: "Update Payment Status", logTrace });

      await updateQuery;

      return {
        success: true,
        reference_no: transactionId,
        payment_status: paymentStatus
      };
    } catch (error) {
      const errData = error.response?.data || error.message;
      fastify.log.error({
        message: "PhonePe EDC Status Error",
        logTrace,
        error: errData,
        statusCode: error.response?.status
      });

      throw CustomError.create({
        httpCode: error.response?.status || StatusCodes.BAD_GATEWAY,
        message: errData?.message || errData || "PhonePe EDC status check failed",
        property: "external_api",
        code: "PHONEPAY_EDC_STATUS_FAILED"
      });
    }
  }
  // EDC Transaction Status — call BFF, update OUTLET_PAYMENT_LOGS status
  async function dqrTransactionStatus({ params, logTrace, userDetails }) {
    const knex = this;
    const { transactionId } = params;

    if (!transactionId) {
      throw CustomError.create({
        httpCode: StatusCodes.BAD_REQUEST,
        message: "Transaction ID is required",
        property: "transactionId",
        code: "TRANSACTION_ID_REQUIRED"
      });
    }

    // Fetch existing bill payment row
    const billPayment = await knex(OUTLET_PAYMENT_LOGS.NAME)
      .where(OUTLET_PAYMENT_LOGS.COLUMNS.REFERENCE_ID, transactionId)
      .first();

    if (!billPayment) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_FOUND,
        message: `Transaction payment record not found for id: ${transactionId}`,
        property: "transactionId",
        code: "TRANSACTION_NOT_FOUND"
      });
    }

    // Fetch provider config via provider_id on the bill payment row
    const providerConfig = await knex(PAYMENT_PROVIDER_DEVICE_CONFIG.NAME)
      .where(PAYMENT_PROVIDER_DEVICE_CONFIG.COLUMNS.ID, billPayment[OUTLET_PAYMENT_LOGS.COLUMNS.PROVIDER_ID])
      .first();

    if (!providerConfig) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_FOUND,
        message: "Payment provider config not found",
        property: "provider_id",
        code: "PROVIDER_CONFIG_NOT_FOUND"
      });
    }

    const { merchant_id } = providerConfig;
    const bill_payment_id = billPayment[OUTLET_PAYMENT_LOGS.COLUMNS.ID];

    fastify.log.debug({
      message: "PhonePe EDC Status Request",
      logTrace,
      merchant_id,
      transactionId
    });

    try {
      const url = `${providerConfig.url}/edc/transaction/status/${merchant_id}/${transactionId}`;
      const response = await axios.get(url, {
        headers: { "Content-Type": "application/json" },
        timeout: 30000
      });

      fastify.log.debug({
        message: "PhonePe EDC Status Response",
        logTrace,
        responseCode: response.status
      });

      // Map BFF response status to our status
      const bffStatus = response.data?.data?.status || response.data?.status || "";
      let paymentStatus = "PENDING";

      if (["COMPLETED", "SUCCESS", "PAYMENT_SUCCESS"].includes(bffStatus.toUpperCase())) {
        paymentStatus = "SUCCESS";
      } else if (["FAILED", "PAYMENT_FAILED", "DECLINED", "ERROR"].includes(bffStatus.toUpperCase())) {
        paymentStatus = "FAILED";
      }

      // Update OUTLET_PAYMENT_LOGS
      const updateQuery = knex(OUTLET_PAYMENT_LOGS.NAME)
        .where(OUTLET_PAYMENT_LOGS.COLUMNS.ID, bill_payment_id)
        .update({
          [OUTLET_PAYMENT_LOGS.COLUMNS.PAYMENT_STATUS]: paymentStatus,
          [OUTLET_PAYMENT_LOGS.COLUMNS.RESPONSE_PAYLOAD]: JSON.stringify(response.data),
          [OUTLET_PAYMENT_LOGS.COLUMNS.UPDATED_BY]: userDetails.id,
          [OUTLET_PAYMENT_LOGS.COLUMNS.UPDATED_AT]: new Date()
        });

      logQuery({ logger: fastify.log, query: updateQuery, context: "Update Payment Status", logTrace });

      await updateQuery;

      return {
        success: true,
        bill_payment_id: Number(bill_payment_id),
        payment_status: paymentStatus,
        data: response.data
      };
    } catch (error) {
      const errData = error.response?.data || error.message;
      fastify.log.error({
        message: "PhonePe EDC Status Error",
        logTrace,
        error: errData,
        statusCode: error.response?.status
      });

      throw CustomError.create({
        httpCode: error.response?.status || StatusCodes.BAD_GATEWAY,
        message: errData?.message || errData || "PhonePe EDC status check failed",
        property: "external_api",
        code: "PHONEPAY_EDC_STATUS_FAILED"
      });
    }
  }

  // Cancel Payment - call BFF, update OUTLET_PAYMENT_LOGS status
  async function cancelPayment({ params, logTrace, userDetails }) {
    const knex = this;

    const { transactionId } = params;

    if (!transactionId) {
      throw CustomError.create({
        httpCode: StatusCodes.BAD_REQUEST,
        message: "Transaction ID is required",
        property: "transactionId",
        code: "TRANSACTION_ID_REQUIRED"
      });
    }

    // Fetch existing bill payment row
    const billPayment = await knex(OUTLET_PAYMENT_LOGS.NAME)
      .where(OUTLET_PAYMENT_LOGS.COLUMNS.REFERENCE_ID, transactionId)
      .first();

    if (!billPayment) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_FOUND,
        message: `Transaction payment record not found for id: ${transactionId}`,
        property: "transactionId",
        code: "TRANSACTION_NOT_FOUND"
      });
    }

    // Fetch provider config via provider_id on the bill payment row
    const providerConfig = await knex(PAYMENT_PROVIDER_DEVICE_CONFIG.NAME)
      .where(PAYMENT_PROVIDER_DEVICE_CONFIG.COLUMNS.PAYMENT_PROVIDER_ID, billPayment.provider_id)
      .first();

    if (!providerConfig) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_FOUND,
        message: "Payment provider config not found",
        property: "provider_id",
        code: "PROVIDER_CONFIG_NOT_FOUND"
      });
    }

    const { merchant_id } = providerConfig;
    const bill_payment_id = billPayment[OUTLET_PAYMENT_LOGS.COLUMNS.ID];

    fastify.log.debug({
      message: "PhonePe EDC Status Request",
      logTrace,
      merchant_id,
      transactionId
    });


    try {
      const url = `${providerConfig.url}/v1/phonepay/cancel/payment/${merchant_id}/${transactionId}`;
      const response = await axios.post(url, null, {
        headers: { "Content-Type": "application/json" },
        timeout: 30000
      });

      fastify.log.debug({
        message: "PhonePe Cancel Payment Response",
        logTrace,
        responseCode: response.status
      });

      if (response.data?.success === false) {
        throw CustomError.create({
          httpCode: StatusCodes.BAD_GATEWAY,
          message: response.data?.message || "PhonePe payment cancel failed",
          property: "cancel_payment_api",
          code: "PHONEPAY_CANCEL_PAYMENT_FAILED"
        });
      }

      if (billPayment) {
        const updateQuery = knex(OUTLET_PAYMENT_LOGS.NAME)
          .where(OUTLET_PAYMENT_LOGS.COLUMNS.ID, bill_payment_id)
          .update({
            [OUTLET_PAYMENT_LOGS.COLUMNS.PAYMENT_STATUS]: "cancelled",
            [OUTLET_PAYMENT_LOGS.COLUMNS.TRANSACTION_STATUS]: JSON.stringify(response.data),
            [OUTLET_PAYMENT_LOGS.COLUMNS.UPDATED_BY]: userDetails.id,
            [OUTLET_PAYMENT_LOGS.COLUMNS.UPDATED_AT]: new Date()
          });

        logQuery({ logger: fastify.log, query: updateQuery, context: "Cancel PhonePe Payment", logTrace });
        await updateQuery;
      }

      return {
        success: true,
        reference_no: transactionId,
        payment_status: "cancelled"
      };
    } catch (error) {
      const errData = error.response?.data || error.message;
      fastify.log.error({
        message: "PhonePe Cancel Payment Error",
        logTrace,
        error: errData,
        statusCode: error.response?.status
      });

      throw CustomError.create({
        httpCode: error.response?.status || StatusCodes.BAD_GATEWAY,
        message: errData?.message || errData || "PhonePe payment cancel failed",
        property: "external_api",
        code: "PHONEPAY_CANCEL_PAYMENT_FAILED"
      });
    }
  }

  return {
    getPaymentProvider,
    dqrInit,
    paymentLinkSms,
    dqrTransactionStatus,
    sedcTransactionInit,
    edcTransactionStatus,
    cancelPayment
  };
}

module.exports = phonepayRepo;
