const winston = require('winston');
require('express-async-errors')

const { combine, timestamp, json, colorize, printf } = winston.format;

const consoleFormat = printf((info) => {
    const { level, message, timestamp, stack, isOperational } = info;
    const logMessage = `${ timestamp } ${ level }: ${ message }`;

    if ( stack && !isOperational ) {
        return `${ logMessage }\n${ stack }`;
    }
    return logMessage;
})

exports.setupLogging = () => {

    const logger = winston.createLogger({
        level: 'info', // (info, warn, error)
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
        ),
        transports: [
            new winston.transports.Console({
                format: winston.format.combine(
                    colorize(),
                    consoleFormat
                ),
            }),

            new winston.transports.File({ filename: 'logs/combined.log' }),
            new winston.transports.File({ filename: 'logs/error.log', level: 'error' })
        ],
        exceptionHandlers: [
            new winston.transports.File({ filename: 'logs/uncaughtExceptions.log' }),
        ],
        rejectionHandlers: [
            new winston.transports.File({ filename: 'logs/unhandledRejections.log' }),
        ]
    })

    global.logger = logger

    logger.info('Winston logger configured soccessfully')
}