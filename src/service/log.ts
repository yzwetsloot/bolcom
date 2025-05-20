import winston from "winston";
const { createLogger, format, transports } = winston;

import config from "../config.js";

const formatters = [
  format.timestamp({
    format: "DD-MM-YYYY HH:mm:ss.SSS",
  }),
  format.errors({ stack: true }),
  format.splat(),
  format.simple(),
];

const logger = createLogger({
  level: config.log.level,
  transports: [
    new transports.File({
      format: format.combine(...formatters),
      filename: config.log.path,
      maxsize: config.log.maxSize,
      maxFiles: 1,
      tailable: true,
    }),
  ],
});

if (config.environment === "dev") {
  logger.add(
    new transports.Console({
      format: format.combine(format.colorize(), ...formatters),
    })
  );
}

export default logger;
