const swaggerAutogen = require('swagger-autogen')({ openapi: '3.0.0' });
const outputFile = "./swagger.json";
const endpointsFiles = ["./index.js"];
const config = {};

swaggerAutogen(outputFile, endpointsFiles, config);