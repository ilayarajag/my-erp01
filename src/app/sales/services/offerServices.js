const { StatusCodes } = require("http-status-codes");
const { CustomError } = require("../../errorHandler");

const productRepo = require("../repository/product");
const getOffersServices = require("../services/productServices");
function getOfferInfoService(fastify) {
  const { getOfferCount, getOfferDetails } = productRepo(fastify);
  return async ({ params, body, outlet_id, logTrace, userDetails }) => {
    const knex = fastify.knexMedical;
    const currentDate = getCurrentDate();
    let offamt = 0;
    let lblofamt = 0;
    let pramt1 = 0;
    const response = await getOfferCount.call(knex, {
      body,
      gdate: currentDate,
      outlet_id,
      logTrace,
      userDetails
    });
    console.log("body", body);

    if (response > 0) {
      const getOffers = getOffersServices.getOffersServices(fastify);
      if (body.length > 0) {
        const product_offers_promises = body.map(async product => {
          const response1 = await getOfferDetails.call(knex, {
            prod_id: product.prod_id, // Pass the current product to getOfferDetails
            prod_code: product.prod_code, // Pass the current product to getOfferDetails
            qty: product.qty, // Pass the current product to getOfferDetails
            mrp: product.mrp, // Pass the current product to getOfferDetails
            gdate: currentDate,
            logTrace,
            userDetails,
            outlet_id
          });
          return response1; // Return the response from getOfferDetails
        });
        const productOffers = await Promise.all(product_offers_promises);
        console.log("productOffers11", productOffers);

        //   return productOffers;
        for (let i = 0; i < productOffers.length; i++) {
          const offers = productOffers[i]; // Get the offers for the current product
          const isEmpty = Object.keys(offers).length === 0;
          if (!isEmpty) {
            const {
              otype,
              obuy,
              oget,
              obuyid,
              ogetid,
              dis,
              poff,
              omode,
              comp,
              shop,
              qty,
              mrp,
              prod_code,
              prod_id
            } = offers;
            const getOfferRate = await getOffers({
              logTrace,
              query: {
                prod_id: prod_id,
                prod_code: prod_id,
                is_offer_flag: false
              },
              userDetails,
              outlet_id
            });

            if (
              Object.keys(getOfferRate.discountInfo || {}).length === 0 &&
              Object.keys(getOfferRate.priceOffInfo || {}).length === 0 &&
              Object.keys(getOfferRate.specialOfferInfo || {}).length === 0
            ) {
              switch (otype) {
                case 1:
                  // *** Buy and Get same product ***
                  if (omode == 0) {
                    // Free
                    // ***  Eligible for No. of Buying qty for a item ***
                    if (qty >= obuy) {
                      const oqty = Math.ceil(qty / (obuy + oget));
                      console.log("quantitycheck", qty);

                      let fqty = oqty * oget;
                      if (qty == 1) {
                        fqty = 0.5;
                      }


                      offamt = Number(offamt) + Number(fqty * mrp);
                      lblofamt = Number(lblofamt) + Number(fqty * mrp);
                      offamt = offamt.toFixed(2);
                      lblofamt = lblofamt.toFixed(2);
                    }
                  }
                  if (omode == 1) {
                    // Discount
                    // ***  Eligible for No. of Buying qty for a item ***
                    console.log("omode", omode);
                    console.log("qty", qty);
                    console.log("qty >= obuy", qty >= obuy);

                    if (qty >= obuy) {
                      const oqty = Math.ceil(qty / (obuy + oget));
                      const fqty = oqty;

                      offamt =
                        Number(offamt) +
                        Number(fqty * obuy * mrp * (dis / 100));
                      offamt = offamt.toFixed(2);
                    }
                  }
                  if (omode == 2) {
                    // Price Off
                    // ***  Eligible for No. of Buying qty for a item ***
                    if (qty >= obuy) {
                      const oqty = Math.ceil(qty / (obuy + oget));
                      const fqty = oqty;
                      offamt = Number(offamt) + Number(fqty * poff);
                      offamt = offamt.toFixed(2);
                    }
                  }

                  break;
                case 2:
                  // Handle otype 2
                  //   ***  Buy and Get Different product  ***
                  if (omode === 0) {
                    // Free
                    // Eligible for No. of Buying qty for an item
                    if (qty >= obuy) {
                      const oqty = Math.floor(qty / obuy);
                      for (let j = 0; j < productOffers.length; j++) {
                        if (i != j) {
                          const offersList = productOffers[j];
                          const isEmptyCheck =
                            Object.keys(offersList).length === 0;
                          if (!isEmptyCheck) {
                            const prod_id1 = offersList.prod_id;
                            const ogetid1 = offersList.ogetid;
                            const mrp1 = offersList.mrp;
                            const qty1 = offersList.qty;
                            if (prod_id1 == ogetid) {
                              if (qty >= oget) {
                                const gqty = Math.floor(qty / oget);
                                let fqty = 0;
                                if (gqty >= oqty) {
                                  fqty = oqty * oget;
                                } else {
                                  fqty = gqty * oget;
                                }
                                offamt = Number(offamt) + Number(fqty * mrp1);
                                lblofamt =
                                  Number(lblofamt) + Number(fqty * mrp1);
                                offamt = offamt.toFixed(2);
                                lblofamt = offamt;
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                  // if (omode === 1) {
                  //   // Discount
                  //   // Eligible for No. of Buying qty for an item

                  //   if (qty >= obuy) {
                  //     const oqty = Math.floor(qty / obuy);
                  //     for (let j = 0; j < productOffers.length; j++) {
                  //       console.log("productOffersloop", productOffers);

                  //       if (i != j) {
                  //         console.log("i,j",i,j);

                  //         const offersList = productOffers[j];
                  //         console.log("offersList", offersList);

                  //         const isEmptyCheck =
                  //           Object.keys(offersList).length === 0;
                  //           console.log("isEmptyCheck", isEmptyCheck);

                  //         if (!isEmptyCheck) {
                  //           const prod_id1 = offersList.prod_id;
                  //           const ogetid1 = offersList.ogetid;
                  //           const mrp1 = offersList.mrp;
                  //           if (prod_id1 == ogetid) {
                  //             if (qty >= oget) {
                  //               const gqty = Math.floor(qty / oget);
                  //               let fqty = 0;
                  //               if (gqty >= oqty) {
                  //                 fqty = oqty * oget;
                  //               } else {
                  //                 fqty = gqty * oget;
                  //               }
                  //               offamt =
                  //                 Number(offamt) +
                  //                 Number(fqty * mrp1 * (dis / 100));
                  //               offamt = offamt.toFixed(2);
                  //               lblofamt = offamt;
                  //             }
                  //           }
                  //         }
                  //       }
                  //     }
                  //   }
                  // }
                  if (omode === 1) {
                    // Discount
                    if (qty >= obuy) {
                      const oqty = Math.floor(qty / obuy);

                      for (let j = 0; j < body.length; j++) {
                        if (i !== j) {
                          const offersList = body[j];
                          //console.log("offersList", offersList);

                          if (Object.keys(offersList).length !== 0) {
                            const prod_id1 = offersList.prod_id;
                            const mrp1 = Number(offersList.mrp);
                            const qty1 = Number(offersList.qty); // Get product quantity

                            // Check matching get product
                            if (prod_id1 == ogetid) {

                              // Check available get product quantity
                              if (qty1 >= oget) {

                                const gqty = Math.floor(qty1 / oget);

                                let fqty = 0;

                                if (gqty >= oqty) {
                                  fqty = oqty * oget;
                                } else {
                                  fqty = gqty * oget;
                                }

                                const discountAmount = fqty * mrp1 * (dis / 100);
                              
                                console.log("discountAmountdiff", discountAmount);
                                offamt = Number(offamt) + discountAmount;
                                offamt = offamt.toFixed(2);
                                lblofamt = offamt;

                              }
                            }
                          }
                        }
                      }
                    }
                  }
                  if (omode === 2) {
                    // Price Off
                    if (qty >= obuy) {
                      const oqty = Math.floor(qty / obuy);

                      for (let j = 0; j < body.length; j++) {
                        const offersList = body[j];

                        if (Object.keys(offersList).length !== 0) {
                          const prod_id1 = offersList.prod_id;
                          const qty1 = Number(offersList.qty); // Get product quantity

                          // Check matching get product
                          if (prod_id1 == ogetid) {

                            if (qty1 >= oget) {

                              const gqty = Math.floor(qty1 / oget);

                              let fqty = 0;

                              if (gqty >= oqty) {
                                fqty = oqty * oget;
                              } else {
                                fqty = gqty * oget;
                              }

                              // poff comes from current offer
                              const priceOffAmount = fqty * Number(poff);
                              console.log("priceOffAmount", priceOffAmount);
                              offamt = Number(offamt) + priceOffAmount;
                              offamt = offamt.toFixed(2);
                              lblofamt = offamt;
                            }
                          }
                        }
                      }
                    }
                  }
                  break;
                default:
                  // Handle other otype values
                  break;
              }
            }
          }
        }
        return { offamt, lblofamt };
      }
    } else {
      return {
        offamt: 0,
        lblofamt: 0
      };
    }
  };
}

function getCurrentDate() {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const day = String(currentDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

module.exports = {
  getOfferInfoService
};
