var YAML = require("yamljs");
const swaggerUi = require("swagger-ui-express");
//import log from "./logger";

const swaggerSpec = YAML.load("./swagger.yaml");

const router = require("express").Router();

router.use("/", swaggerUi.serve);
router.get("/", swaggerUi.setup(swaggerSpec));

module.exports = router;
