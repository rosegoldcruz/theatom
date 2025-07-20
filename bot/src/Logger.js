const winston = require('winston');
const path = require('path');
const fs = require('fs');

class Logger {
  constructor(component = 'Bot') {
    this.component = component;
    this.setupLogger();
  }

  setupLogger() {
    // Create logs directory if it doesn't exist
    const logsDir = path.join(__dirname, '..', 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    // Custom format for logs
    const logFormat = winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
      }),
      winston.format.errors({ stack: true }),
      winston.format.printf(({ timestamp, level, message, component, ...meta }) => {
        const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
        return `${timestamp} [${level.toUpperCase()}] [${component || this.component}] ${message} ${metaStr}`;
      })
    );

    // Create the logger
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: logFormat,
      transports: [
        // Console transport
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            logFormat
          )
        }),
        
        // File transport for all logs
        new winston.transports.File({
          filename: path.join(logsDir, 'bot.log'),
          maxsize: 10 * 1024 * 1024, // 10MB
          maxFiles: 5,
          tailable: true
        }),
        
        // Separate file for errors
        new winston.transports.File({
          filename: path.join(logsDir, 'error.log'),
          level: 'error',
          maxsize: 10 * 1024 * 1024, // 10MB
          maxFiles: 3,
          tailable: true
        }),
        
        // Separate file for trades
        new winston.transports.File({
          filename: path.join(logsDir, 'trades.log'),
          level: 'info',
          maxsize: 50 * 1024 * 1024, // 50MB
          maxFiles: 10,
          tailable: true,
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          )
        })
      ]
    });

    // Handle uncaught exceptions
    this.logger.exceptions.handle(
      new winston.transports.File({
        filename: path.join(logsDir, 'exceptions.log')
      })
    );

    // Handle unhandled promise rejections
    this.logger.rejections.handle(
      new winston.transports.File({
        filename: path.join(logsDir, 'rejections.log')
      })
    );
  }

  debug(message, meta = {}) {
    this.logger.debug(message, { component: this.component, ...meta });
  }

  info(message, meta = {}) {
    this.logger.info(message, { component: this.component, ...meta });
  }

  warn(message, meta = {}) {
    this.logger.warn(message, { component: this.component, ...meta });
  }

  error(message, meta = {}) {
    this.logger.error(message, { component: this.component, ...meta });
  }

  // Special method for trade logging
  logTrade(tradeData) {
    this.logger.info('TRADE_EXECUTED', {
      component: 'TradeLogger',
      trade: tradeData,
      timestamp: new Date().toISOString()
    });
  }

  // Special method for opportunity logging
  logOpportunity(opportunityData) {
    this.logger.info('OPPORTUNITY_FOUND', {
      component: 'OpportunityLogger',
      opportunity: opportunityData,
      timestamp: new Date().toISOString()
    });
  }

  // Special method for performance logging
  logPerformance(performanceData) {
    this.logger.info('PERFORMANCE_REPORT', {
      component: 'PerformanceLogger',
      performance: performanceData,
      timestamp: new Date().toISOString()
    });
  }

  // Method to change log level dynamically
  setLevel(level) {
    this.logger.level = level;
    this.logger.transports.forEach(transport => {
      if (transport.level !== 'error') { // Don't change error-only transports
        transport.level = level;
      }
    });
    this.info(`Log level changed to: ${level}`);
  }

  // Method to get current log level
  getLevel() {
    return this.logger.level;
  }

  // Method to flush logs (useful for testing)
  flush() {
    return new Promise((resolve) => {
      this.logger.on('finish', resolve);
      this.logger.end();
    });
  }
}

module.exports = Logger;
