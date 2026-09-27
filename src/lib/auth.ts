import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const SALT_ROUNDS = 10;
const TOKEN_EXPIRY_HOURS = 24;

export interface UserPayload {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string | null;
  department?: string | null;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function createUser(
  email: string,
  password: string,
  name: string,
  role: string = 'citizen'
): Promise<UserPayload> {
  const hashedPassword = await hashPassword(password);
  
  const user = await db.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role,
    },
  });
  
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatar: user.avatar,
    department: user.department,
  };
}

export async function authenticateUser(
  email: string,
  password: string
): Promise<{ user: UserPayload; token: string } | null> {
  const user = await db.user.findUnique({
    where: { email },
  });
  
  if (!user || !user.isActive) {
    return null;
  }
  
  const isValid = await verifyPassword(password, user.password);
  if (!isValid) {
    return null;
  }
  
  // Update last login
  await db.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });
  
  // Create session token
  const token = uuidv4();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + TOKEN_EXPIRY_HOURS);
  
  await db.session.create({
    data: {
      userId: user.id,
      token,
      expiresAt,
    },
  });
  
  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      department: user.department,
    },
    token,
  };
}

export async function validateToken(token: string): Promise<UserPayload | null> {
  const session = await db.session.findUnique({
    where: { token },
    include: { user: true },
  });
  
  if (!session || session.expiresAt < new Date()) {
    // Clean up expired session
    if (session) {
      await db.session.delete({ where: { id: session.id } });
    }
    return null;
  }
  
  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role,
    avatar: session.user.avatar,
    department: session.user.department,
  };
}

export async function logout(token: string): Promise<void> {
  try {
    await db.session.delete({ where: { token } });
  } catch {
    // Session might not exist
  }
}

export async function getUserByEmail(email: string) {
  return db.user.findUnique({ where: { email } });
}

export async function getUserById(id: string) {
  return db.user.findUnique({ where: { id } });
}
