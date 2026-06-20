const phonepayRepo = require("../repository/phonepayRepo");
const getCartServices = require("../../../sales/services/getCartServices");
const billnoServices = require("../../../billno/services/billnoServices");
const outletinfoServices = require("../../../catalog/outletmembers/services/outletMembersServices");
const { StatusCodes } = require("http-status-codes");
const { CustomError } = require("../../../errorHandler");


const validatePaymentAmount = (finalAmount, mode, isCardPayment) => {
  if (!mode || mode.length === 0) {
    throw CustomError.create({
      httpCode: StatusCodes.BAD_REQUEST,
      message: "Payment modes must be provided",
      property: "mode",
      code: "PAYMENT_MODES_REQUIRED"
    });
  }

  const amount = mode.filter(
    item => item.mode === (isCardPayment ? 3 : 2)
  )[0]?.amount || 0;

  if (!amount || Number(amount) <= 0) {
    throw CustomError.create({
      httpCode: StatusCodes.BAD_REQUEST,
      message: "Valid amount is required for payment mode",
      property: "amount",
      code: "AMOUNT_REQUIRED"
    });
  }

  return amount;
};


function sedcTransactionInitService(fastify) {
  const { sedcTransactionInit, dqrInit,paymentLinkSms, getPaymentProvider } = phonepayRepo(fastify);
  const getCart = getCartServices.getCartServices(fastify);
  const getbillnoInfo = billnoServices.getbillnoInfoInfoService(fastify);
  const getoutletmemberInfo = outletinfoServices.getOutletMembersInfoService(fastify);

  return async ({ body, logTrace, userDetails }) => {
    try {
      const users_id = userDetails.id;
      const counter_no = body.counter_no;
      const outlet_id = body.outlet_id;
      const is_card = body.is_card;
      const customer_id = body.customer_id;
      const mode = body.mode || [];
      const pay_type_id = body.pay_type_id;
      const provider_id = body.provider_id;

      // Validate required fields
      if (!counter_no || !outlet_id || !provider_id) {
        throw CustomError.create({
          httpCode: StatusCodes.BAD_REQUEST,
          message: "Missing required fields: counter_no, outlet_id, provider_id",
          property: "body",
          code: "REQUIRED_FIELDS_MISSING"
        });
      }

      const cartItems = await getCart({
        logTrace,
        query: {
          users_id,
          counter_no,
          outlet_id
        }
      });

      if (!cartItems || cartItems.cart_lines.length <= 0) {
        throw CustomError.create({
          httpCode: StatusCodes.NOT_ACCEPTABLE,
          message: "No Cart items found. add items to cart and proceed",
          property: "cart",
          code: "NOT_ACCEPTABLE"
        });
      }

      const getBillNo = await getbillnoInfo.call(fastify.knexMedical, {
        users_id,
        counter_no,
        outlet_id,
        body: {
          counter_no,
          outlet_id
        },
        logTrace,
        userDetails
      });

      if (!getBillNo || !getBillNo.billno) {
        throw CustomError.create({
          httpCode: StatusCodes.BAD_REQUEST,
          message: "Unable to generate bill number",
          property: "billno",
          code: "BILLNO_GENERATION_FAILED"
        });
      }

      const getMemberInfo = await getoutletmemberInfo.call(fastify.knexMedical, {
        users_id,
        counter_no,
        outlet_id,
        params: {
          member_id: customer_id
        },
        logTrace,
        userDetails
      });

      const memberInfo = getMemberInfo && getMemberInfo[0] ? getMemberInfo[0] : {};

      // Get payment provider config
      const provider_res = await getPaymentProvider.call(fastify.knexMedical, {
        counter_no,
        users_id,
        outlet_id,
        provider_id,
        logTrace
      });

      const provider_name = provider_res.provider_name;
      const billno = getBillNo.billno;
      let reference_no = null;
      let qrString = null;


      let finalAmount = cartItems?.cart_net_total || 0;

      // Validate amount if split payment
      if (body.is_split_payment) {
        finalAmount = validatePaymentAmount(finalAmount, mode, isCardPayment);
      }

      if (finalAmount <= 0) {
        throw CustomError.create({
          httpCode: StatusCodes.BAD_REQUEST,
          message: "Transaction amount must be greater than zero",
          property: "amount",
          code: "INVALID_AMOUNT"
        });
      }

      // const { is_card, provider_id, counter_no, outlet_id } = body;
      const input = {
        is_card,
        provider_id,
        counter_no,
        outlet_id,
        pay_type_id,
        customer_id: memberInfo?.id || null,
        amount: finalAmount,
        billno,
        cartItems
      }

      // Route to appropriate payment handler based on provider type
      if (provider_name.toLowerCase() === "phonepay_edc") {

        const response = await sedcTransactionInit.call(fastify.knexMedical, { input, logTrace, userDetails });
        reference_no = response.transaction_ref_no;

      }
      else if (provider_name.toLowerCase() === "phonepe_dqr") {

        const response = await dqrInit.call(fastify.knexMedical, { input, logTrace, userDetails });
        reference_no = response.transaction_ref_no;
        qrString = response.qrString;
      }
      else if (provider_name.toLowerCase() === "phonepe_payment_link") {
        const response = await paymentLinkSms.call(fastify.knexMedical, { input, logTrace, userDetails });
        reference_no = response.transaction_ref_no;
        
      } else {
        throw CustomError.create({
          httpCode: StatusCodes.BAD_REQUEST,
          message: `Unsupported payment provider: ${provider_name}`,
          property: "provider_name",
          code: "UNSUPPORTED_PROVIDER"
        });
      }

      if (!reference_no) {
        throw CustomError.create({
          httpCode: StatusCodes.INTERNAL_SERVER_ERROR,
          message: "Failed to generate transaction reference",
          property: "reference_no",
          code: "REFERENCE_NO_GENERATION_FAILED"
        });
      }

      return {
        success: true,
        billno,
        reference_no,
        ...(qrString && { qrString })
      };

    } catch (error) {
      fastify.log.error({
        message: "sedcTransactionInitService Error",
        logTrace,
        error: error.message
      });
      throw error;
    }
  };
}

function edcTransactionStatusService(fastify) {
  const { edcTransactionStatus } = phonepayRepo(fastify);
  return async ({ params, logTrace, userDetails }) => {
    try {
      return await edcTransactionStatus.call(fastify.knexMedical, { params, logTrace, userDetails });
    } catch (error) {
      fastify.log.error({
        message: "edcTransactionStatusService Error",
        logTrace,
        error: error.message
      });
      throw error;
    }
  };
}

function cancelPaymentService(fastify) {
  const { cancelPayment } = phonepayRepo(fastify);
  return async ({ params, logTrace, userDetails }) => {
    try {
      return await cancelPayment.call(fastify.knexMedical, { params, logTrace, userDetails });
    } catch (error) {
      fastify.log.error({
        message: "cancelPaymentService Error",
        logTrace,
        error: error.message
      });
      throw error;
    }
  };
}

// DQR Init Service
function dqrInitService(fastify) {
  const { dqrInit } = phonepayRepo(fastify);
  return async ({ body, logTrace, userDetails }) => {
    try {
      return await dqrInit.call(fastify.knexMedical, { body, logTrace, userDetails });
    } catch (error) {
      fastify.log.error({
        message: "dqrInitService Error",
        logTrace,
        error: error.message
      });
      throw error;
    }
  };
}

module.exports = {
  dqrInitService,
  sedcTransactionInitService,
  edcTransactionStatusService,
  cancelPaymentService
};
