const { errorSchemas } = require("../../commons/schemas/errorSchemas");

const getloyalitySchema = {
  tags: ["SETTING"],
  summary: "This API is used to get cart details. ",
  headers: { $ref: "request-headers#" },
  response: {
    200: {
        // items: {
          type: "object",
          properties: {
            Mcard: { type: "integer" },
            Plimit: { type: "number" },
            PPoint:{ type: "number" },
            Pamount:{ type: "number" },
            rpoint:{ type: "number" },
            ramount:{ type: "number" }
  
          }
        // }

    },
    ...errorSchemas

}

};

module.exports = getloyalitySchema;

