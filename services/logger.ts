import { createLogger, format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const emojiByLevel: Record<string, string> = {
  error: "❌",
  warn: "⚠️",
  info: "ℹ️",
  http: "🌐",
  verbose: "🔍",
  debug: "🐛",
  silly: "🤪",
};

const getLogger = (fileName = "application") => {
  const fileLogTransport = new DailyRotateFile({
    filename: `logs/${fileName}-%DATE%.log`,
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "30d",
    level: "info",
  });

  const consoleTransport = new transports.Console({
    level: process.env.LOG_LEVEL || "debug",
    handleExceptions: true,
    format: format.combine(
      format.colorize({ all: true }),
      format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      format.errors({ stack: true }),
      format.printf(({ timestamp, level, message, stack }) => {
        const emoji = emojiByLevel[level] || "";
        if (stack) {
          return `${timestamp} ${emoji} [${level}] ${message}\n${stack}`;
        }
        return `${timestamp} ${emoji} [${level}] ${message}`;
      })
    ),
  });

  const logger = createLogger({
    level: "debug",
    format: format.combine(
      format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      format.errors({ stack: true }),
      format.splat(),
      format.json()
    ),
    transports: [consoleTransport],
    exitOnError: false,
  });

  if (process.env.NODE_ENV !== "production") {
    logger.add(fileLogTransport);
  }

  return logger;
};

export default getLogger();
