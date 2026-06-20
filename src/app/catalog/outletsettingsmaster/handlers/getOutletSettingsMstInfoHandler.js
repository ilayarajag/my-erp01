const outletSettingsMstServices = require("../services/outletSettingsMstServices");

function getOutletSettingsMstInfoHandler(fastify) {
    const getOutletSettingsMstInfo = outletSettingsMstServices.getOutletSettingsMstInfoService(fastify);
    return async (request, reply) => {
        const { params, logTrace, userDetails } = request;
        const response = await getOutletSettingsMstInfo({
            params,
            logTrace,
            userDetails
        });
        return reply.code(200).send(response);
    };
}

module.exports = getOutletSettingsMstInfoHandler