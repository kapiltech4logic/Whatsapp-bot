// export const logger = (req, res, next) => {
//   console.log('INCOMING:', req.method, req.url);
//   next();
// };

// filepath: src/middleware/logger.js
export const logger = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url} ${res.statusCode} ${duration}ms`);
  });
  next();
};