import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from './db.service';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';
import { SignupInput, LoginInput } from '../validators/auth.schema';

export class AuthService {
  private static readonly SALT_ROUNDS = 12;

  public static async signup(data: SignupInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) {
      throw new AppError('Email already in use', 400);
    }

    const hashedPassword = await bcrypt.hash(data.password, this.SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    const token = this.signToken(user.id);

    return { user, token };
  }

  public static async login(data: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (!user || !(await bcrypt.compare(data.password, user.password))) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = this.signToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  private static signToken(userId: string): string {
    return jwt.sign({ id: userId }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });
  }
}
