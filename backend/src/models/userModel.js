/**
 * User Data Access Model & Password Utilities
 * Requirement: SRS FR-01, SEC-01; Test Plan TC-01, TC-02
 * Author: Monika PM (@Monikapm19)
 */
const bcrypt = require('bcryptjs');
const db = require('../config/db');

// In-memory user store for standalone execution, mock environments, and fast unit tests
const inMemoryUsers = new Map();

// Minimum salt rounds enforced per SEC-01: cost factor >= 10
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10;

/**
 * Hash a plaintext password with bcrypt (cost factor >= 10)
 */
const hashPassword = async (password) => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compare a plaintext password against a bcrypt hash
 */
const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

/**
 * Seed initial mock users into the in-memory store
 */
const seedMockUsers = async () => {
  inMemoryUsers.clear();
  const defaultPassword = 'Password@123';
  const defaultHash = await hashPassword(defaultPassword);

  const initialUsers = [
    {
      user_id: 1,
      email: 'admin@edutrack.edu',
      password_hash: defaultHash,
      role: 'Admin',
      is_active: true,
      failed_attempts: 0,
      locked_until: null,
    },
    {
      user_id: 2,
      email: 'faculty@edutrack.edu',
      password_hash: defaultHash,
      role: 'Faculty',
      is_active: true,
      failed_attempts: 0,
      locked_until: null,
    },
    {
      user_id: 3,
      email: 'student@edutrack.edu',
      password_hash: defaultHash,
      role: 'Student',
      is_active: true,
      failed_attempts: 0,
      locked_until: null,
    },
    {
      user_id: 5,
      email: 'student2@edutrack.edu',
      password_hash: defaultHash,
      role: 'Student',
      is_active: true,
      failed_attempts: 0,
      locked_until: null,
    },
    {
      user_id: 4,
      email: 'parent@edutrack.edu',
      password_hash: defaultHash,
      role: 'Parent',
      is_active: true,
      failed_attempts: 0,
      locked_until: null,
    },
  ];

  for (const user of initialUsers) {
    inMemoryUsers.set(user.email.toLowerCase(), { ...user });
  }
};

// Seed immediately for default in-memory usage
seedMockUsers();

/**
 * Find user by email (checks PostgreSQL if configured, otherwise in-memory store)
 */
const findByEmail = async (email) => {
  const normalizedEmail = email ? email.toLowerCase().trim() : '';
  if (!normalizedEmail) return null;

  if (db.pool) {
    const res = await db.query(
      `SELECT u.user_id, u.email, u.password_hash, r.role_name AS role, u.is_active, u.failed_attempts, u.locked_until
       FROM users u
       JOIN roles r ON u.role_id = r.role_id
       WHERE LOWER(u.email) = $1`,
      [normalizedEmail]
    );
    return res.rows[0] || null;
  }

  const user = inMemoryUsers.get(normalizedEmail);
  return user ? { ...user } : null;
};

/**
 * Find user by ID
 */
const findById = async (id) => {
  if (db.pool) {
    const res = await db.query(
      `SELECT u.user_id, u.email, u.password_hash, r.role_name AS role, u.is_active, u.failed_attempts, u.locked_until
       FROM users u
       JOIN roles r ON u.role_id = r.role_id
       WHERE u.user_id = $1`,
      [id]
    );
    return res.rows[0] || null;
  }

  for (const user of inMemoryUsers.values()) {
    if (user.user_id === Number(id)) {
      return { ...user };
    }
  }
  return null;
};

/**
 * Create a new user with bcrypt-hashed password
 */
const createUser = async ({ email, password, role = 'Student', is_active = true }) => {
  const normalizedEmail = email.toLowerCase().trim();
  const passwordHash = await hashPassword(password);

  if (db.pool) {
    const res = await db.query(
      `INSERT INTO users (email, password_hash, role_id, is_active)
       VALUES ($1, $2, (SELECT role_id FROM roles WHERE role_name = $3), $4)
       RETURNING user_id, email, is_active, created_at`,
      [normalizedEmail, passwordHash, role, is_active]
    );
    return { ...res.rows[0], role };
  }

  const newId = inMemoryUsers.size + 1;
  const newUser = {
    user_id: newId,
    email: normalizedEmail,
    password_hash: passwordHash,
    role,
    is_active,
    failed_attempts: 0,
    locked_until: null,
  };
  inMemoryUsers.set(normalizedEmail, newUser);
  return { ...newUser };
};

/**
 * Update account lockout metadata upon failed attempts
 */
const updateLockout = async (email, failedAttempts, lockedUntil) => {
  const normalizedEmail = email.toLowerCase().trim();

  if (db.pool) {
    await db.query(
      `UPDATE users
       SET failed_attempts = $1, locked_until = $2, updated_at = CURRENT_TIMESTAMP
       WHERE LOWER(email) = $3`,
      [failedAttempts, lockedUntil, normalizedEmail]
    );
    return;
  }

  const user = inMemoryUsers.get(normalizedEmail);
  if (user) {
    user.failed_attempts = failedAttempts;
    user.locked_until = lockedUntil;
    inMemoryUsers.set(normalizedEmail, user);
  }
};

/**
 * Reset failed attempts and clear lockout on successful authentication
 */
const resetLockout = async (email) => {
  await updateLockout(email, 0, null);
};

module.exports = {
  SALT_ROUNDS,
  hashPassword,
  comparePassword,
  findByEmail,
  findById,
  createUser,
  updateLockout,
  resetLockout,
  seedMockUsers,
  inMemoryUsers,
};
