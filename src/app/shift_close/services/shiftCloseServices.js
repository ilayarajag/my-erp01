const shiftCloseRepo = require("../repository/shiftCloseRepo");

function getShiftCloseSummaryService(fastify) {
  const { getShiftCloseSummary } = shiftCloseRepo(fastify);
  return async ({ query, logTrace,userDetails }) => {
    const { outlet_id, counter_no, bill_date } = query;
    return getShiftCloseSummary.call(fastify.knexMedical, {
      outlet_id: Number(outlet_id),
      counter_no: Number(counter_no),
      user_id: Number(userDetails.id),
      bill_date,
      logTrace
    });
  };
}

function submitShiftCloseService(fastify) {
  const { submitShiftClose } = shiftCloseRepo(fastify);
  return async ({ body, logTrace, userDetails }) => {
    return submitShiftClose.call(fastify.knexMedical, { body, logTrace, userDetails });
  };
}

module.exports = {
  getShiftCloseSummaryService,
  submitShiftCloseService
};
