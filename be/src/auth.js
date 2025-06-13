const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('./config');

/**
 * Generate JWT token for user id.
 * @param {string} id
 */
function signToken(id) {
  return jwt.sign({ id }, config.jwtSecret, { expiresIn: '15m' });
}

/**
 * Verify JWT token and return payload.
 * @param {string} token
 */
function verifyToken(token) {
  return jwt.verify(token, config.jwtSecret);
}

/**
 * Hash password.
 */
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compare password hash.
 */
function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

module.exports = {
  signToken,
  verifyToken,
  hashPassword,
  comparePassword,
};
