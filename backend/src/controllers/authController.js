/**
 * Authentication Controller
 * Issues:
 *   - #7  [SP-5] FR-01: Secure Authentication & Role-Based Access Control
 *   - #11 [SP-3] SEC-01: JWT Session Security, Password Hashing & Lockout
 * Author: Monika PM (@Monikapm19)
 */
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const { JWT_SECRET } = require('../middleware/roleAuth');

// Constants enforced per IEEE SRS SEC-01 & Issue #11
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes in milliseconds
const TOKEN_EXPIRY = '30m'; // 30 minutes JWT session lifetime

/**
 * POST /api/v1/auth/login
 * Handles user authentication, credential validation, account lockout, and JWT token issuance.
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate request payload
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    // Retrieve user record
    const user = await userModel.findByEmail(email);

    if (!user) {
      // Do not reveal whether user exists for security
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Check account active status
    if (user.is_active === false) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact administration.',
      });
    }

    const now = new Date();

    // Check existing lockout state
    if (user.locked_until) {
      const lockExpiry = new Date(user.locked_until);
      if (now < lockExpiry) {
        const remainingMinutes = Math.ceil((lockExpiry - now) / (60 * 1000));
        return res.status(423).json({
          success: false,
          message: `Account is locked due to consecutive failed attempts. Please try again after ${remainingMinutes} minute(s).`,
          lockedUntil: user.locked_until,
        });
      } else {
        // Lockout duration expired: auto-reset counter and clear lockout
        await userModel.resetLockout(user.email);
        user.failed_attempts = 0;
        user.locked_until = null;
      }
    }

    // Verify password against bcrypt hash
    const isPasswordValid = await userModel.comparePassword(password, user.password_hash);

    if (!isPasswordValid) {
      const updatedAttempts = (user.failed_attempts || 0) + 1;

      if (updatedAttempts >= MAX_FAILED_ATTEMPTS) {
        const lockUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
        await userModel.updateLockout(user.email, updatedAttempts, lockUntil);

        return res.status(423).json({
          success: false,
          message: 'Account locked due to 5 consecutive failed attempts. Please try again after 15 minutes.',
          lockedUntil: lockUntil.toISOString(),
        });
      } else {
        await userModel.updateLockout(user.email, updatedAttempts, null);
        const attemptsRemaining = MAX_FAILED_ATTEMPTS - updatedAttempts;

        return res.status(401).json({
          success: false,
          message: `Invalid email or password. You have ${attemptsRemaining} attempt(s) remaining before lockout.`,
          attemptsRemaining,
        });
      }
    }

    // Password valid: reset failed attempts on successful login
    await userModel.resetLockout(user.email);

    // Sign JWT with role claim and 30-minute expiration
    const payload = {
      user_id: user.user_id,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: TOKEN_EXPIRY,
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      expiresIn: TOKEN_EXPIRY,
      user: {
        user_id: user.user_id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Error during authentication:', error);
    return res.status(500).json({
      success: false,
      message: 'An internal server error occurred during authentication.',
    });
  }
};

/**
 * GET /api/v1/auth/me
 * Returns profile claims of the currently authenticated token
 */
const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
};

module.exports = {
  login,
  getMe,
  MAX_FAILED_ATTEMPTS,
  LOCKOUT_DURATION_MS,
  TOKEN_EXPIRY,
};
