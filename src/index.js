require("dotenv").config({ quiet: true });
const fastifyEnv = require("@fastify/env");
const fastifyHealthcheck = require("fastify-healthcheck");
const envSchema = require("env-schema");
const swagger = require("@fastify/swagger");
const swaggerUi = require("@fastify/swagger-ui");
const fastifyMetrics = require("fastify-metrics");
const fastifyJWT = require("@fastify/jwt");
const cors = require("@fastify/cors");
// const { Server } = require("socket.io");
const path = require("node:path");

const { envSchema: schema } = require("./app/commons/schemas/envSchemas");
const knexConfig = require("../config/index");

// const admin_router = require("./app/accounts/admin/routes");
const admin_router = require("./app/accounts/admin/routes");
const billNoRoutes = require("./app/billno/routes");

// For Authorization
const menus_router = require("./app/authorization/menus/routes");
const sub_menus_router = require("./app/authorization/submenus/routes");
const menu_auth_router = require("./app/authorization/menu_auth/routes");

//master data
const device_router = require("./app/catalog/device/routes");
const outlet_members_router = require("./app/catalog/outletmembers/routes");
const pay_type_router = require("./app/catalog/paytypemaster/routes");
const counters_master_router = require("./app/catalog/countersmaster/routes");
const outlet_counter_payment_mode_router = require("./app/catalog/outletcounterpaymentmodes/routes");

const inaugural_offer_router = require("./app/catalog/inauguraloffer/routes");
const outlet_settings_master_router = require("./app/catalog/outletsettingsmaster/routes");
const outlet_settings_router = require("./app/catalog/outletsettings/routes");
const clearance_sales_settings_router = require("./app/catalog/clearancesalessettings/routes");
const store_manager_router = require("./app/catalog/storemanager/routes");
const parent_child_conv_router = require("./app/catalog/parentchildconversion/routes")

const salesRoutes = require("./app/sales/routes");
//sales return
const salesReturnRoutes = require("./app/sales_return/routes");
const reasonRoutes = require("./app/catalog/reason_master/routes");
const discountRoutes = require("./app/discountpriceoff/routes");
const counterSettingsRoutes = require("./app/catalog/outletcountersettings/routes");
const paymentRoutes = require("./app/payment/routes");
const shift_close_router = require("./app/shift_close/routes");


//payments

const phonepay_router = require("./app/payment/phonepay/routes")

// PLUGINS
const ajv = require("./app/plugins/ajv");
const knex = require("./app/plugins/knex");
const httpClient = require("./app/plugins/httpClient");
const authenticate = require("./app/plugins/jwt");
const authenticate_otp = require("./app/plugins/jwt/otpAuth");
const otpGenerator = require("./app/plugins/otpGeneratorPlugin");
const {
  extractLogTrace,
  requestLogging,
  // responseLogging,
  responseLoggingV2
} = require("./app/hooks/logging");

const {
  SWAGGER_CONFIGS,
  SWAGGER_UI_CONFIGS,
  SERVER_CONFIGS
} = require("./app/commons/configs");
const { METRICS_CONFIGS } = require("./app/commons/metrics.config");

const { errorHandler } = require("./app/errorHandler");

async function create() {
  // eslint-disable-next-line global-require
  const fastify = require("fastify")({
    ...SERVER_CONFIGS,
    bodyLimit: 100 * 1024 * 1024  // 100MB
  });

  fastify.setErrorHandler(errorHandler());
  await fastify.register(fastifyHealthcheck);


  // Env vars plugin
  await fastify.register(fastifyEnv, {
    dotenv: true,
    schema
  });

  // HOOKS
  fastify.addHook("onRequest", extractLogTrace);
  fastify.addHook("preValidation", requestLogging);
  // fastify.addHook("onSend", responseLogging);
  fastify.addHook("onResponse", responseLoggingV2);



  await fastify.register(fastifyJWT, {
    secret: process.env.JWT_SECRET_KEY,
    sign: {
      // expiresIn: "7d" // Token expiration time, e.g., 1 day
      expiresIn: null // Token never expires
    }
  });


  // PLUGINS
  await fastify.register(ajv);
  await fastify.register(knex, knexConfig);
  await fastify.register(swagger, SWAGGER_CONFIGS);
  await fastify.register(swaggerUi, SWAGGER_UI_CONFIGS);
  await fastify.register(httpClient);
  await fastify.register(authenticate);
  await fastify.register(authenticate_otp);

  fastify.register(cors, {
    origin: "*",
    methods: ["GET", "PUT", "POST", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  });
  await fastify.register(otpGenerator);

  await fastify.register(require("@fastify/multipart"), {
    attachFieldsToBody: true,
    limits: {
      fileSize: 100 * 1024 * 1024
    }
  });

  // Fastify-metrics
  if (process.env.NODE_ENV !== "test") {
    await fastify.register(fastifyMetrics, METRICS_CONFIGS);
  }


  // For Admin
  await fastify.register(admin_router, { prefix: "/v1" });
  await fastify.register(billNoRoutes, { prefix: "/v1" });

  // For Admin
  await fastify.register(menus_router, { prefix: "/v1" });
  await fastify.register(sub_menus_router, { prefix: "/v1" });
  await fastify.register(menu_auth_router, { prefix: "/v1" });

  // await fastify.register(admin_router, { prefix: "/v1" });
  await fastify.register(device_router, { prefix: "/v1" });
  await fastify.register(outlet_members_router, { prefix: "/v1" });
  await fastify.register(pay_type_router, { prefix: "/v1" });
  await fastify.register(outlet_counter_payment_mode_router, { prefix: "/v1" });


  await fastify.register(counters_master_router, { prefix: "/v1" });
  await fastify.register(inaugural_offer_router, { prefix: "/v1" });
  await fastify.register(outlet_settings_master_router, { prefix: "/v1" });
  await fastify.register(outlet_settings_router, { prefix: "/v1" });
  await fastify.register(clearance_sales_settings_router, { prefix: "/v1" });
  await fastify.register(store_manager_router, { prefix: "/v1" });
  await fastify.register(parent_child_conv_router, { prefix: "/v1" });

  await fastify.register(salesRoutes, { prefix: "/v1" });
  //sales return
  await fastify.register(salesReturnRoutes, { prefix: "/v1" });
  await fastify.register(reasonRoutes, { prefix: "/v1" });
  await fastify.register(discountRoutes, { prefix: "/v1" });
  await fastify.register(counterSettingsRoutes, { prefix: "/v1" });
  await fastify.register(paymentRoutes, { prefix: "/v1" });
  await fastify.register(phonepay_router, { prefix: "/v1" });
  await fastify.register(shift_close_router, { prefix: "/v1" });



  
  return fastify;
}

async function start() {
  const fastify = await create();
  const defaultSchema = {
    type: "object",
    properties: {
      HOST: {
        type: "string",
        default: "0.0.0.0"
      },
      PORT: {
        type: "integer",
        default: 4444
      }
    }
  };
  const config = envSchema({ schema: defaultSchema, dotenv: true });
  // Run the server!
  fastify.listen({ port: config.PORT, host: config.HOST }, (err, address) => {
    /* istanbul ignore next */
    if (err) {
      fastify.log.error(err);
      process.exit(1);
    }
    // eslint-disable-next-line no-console
    console.log(`server listening on ${address}`);
  });
}

/* istanbul ignore next */
if (process.env.NODE_ENV !== "test") {
  start();
}

module.exports = {
  create,
  start
};
