import winston from 'winston';

winston.loggers.add('server', {
  level: 'info',
  format: winston.format.combine(
    winston.format.label({ label: 'server' }),
    winston.format.colorize(),
    winston.format.json()
  ),
  transports: [
    //
    // - Write all logs with level `error` and below to `error.log`
    // - Write all logs with level `info` and below to `combined.log`
    //
    new winston.transports.File({ filename: 'server.error.log', level: 'error' }),
    new winston.transports.File({ filename: 'server.combined.log' }),
  ],
})

winston.loggers.add('client', {
  level: 'info',
  format: winston.format.combine(
    winston.format.label({ label: 'client' }),
    winston.format.colorize(),
    winston.format.json()
  ),
  transports: [
    //
    // - Write all logs with level `error` and below to `error.log`
    // - Write all logs with level `info` and below to `combined.log`
    //
    new winston.transports.File({ filename: 'client.error.log', level: 'error' }),
    new winston.transports.File({ filename: 'client.combined.log' }),
  ],
})

if (process.env.NODE_ENV === 'test') {
  const ids = ['client', 'server'];
  for (let i = 0; i < ids.length; i++) {
    winston.loggers.get(ids[i]).add(new winston.transports.Console({
      format: winston.format.simple(),
      level: 'warn'
    }));
  }
} else if (process.env.NODE_ENV !== 'production') {
  const ids = ['client', 'server'];
  for (let i = 0; i < ids.length; i++) {
    winston.loggers.get(ids[i]).add(new winston.transports.Console({
      format: winston.format.simple(),
    }));
  }
}