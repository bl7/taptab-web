import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '@/lib/trpc/server';
import { 
  generateToken, 
  generateRefreshToken,
  blacklistToken,
  generateOTP,
  storeOTP,
  verifyOTP
} from '@/lib/auth';
import { sendOTPEmail } from '@/lib/email';
import pool from '@/lib/pg';

export const authRouter = createTRPCRouter({
  // Request OTP for login
  requestOTP: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      const { email } = input;

      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      const user = result.rows[0];

      if (!user || !user.isActive) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      const otp = generateOTP();
      await storeOTP(email, otp);
      await sendOTPEmail(email, otp);

      return { message: 'OTP sent successfully' };
    }),

  // Verify OTP and login
  verifyOTP: publicProcedure
    .input(z.object({
      email: z.string().email(),
      otp: z.string().length(6),
    }))
    .mutation(async ({ input }) => {
      const { email, otp } = input;

      const isValid = await verifyOTP(email, otp);
      if (!isValid) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid OTP',
        });
      }

      const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      const user = userResult.rows[0];

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      const tenantResult = await pool.query('SELECT * FROM tenants WHERE id = $1', [user.tenantId]);
      const tenant = tenantResult.rows[0];

      const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      };

      const token = generateToken(payload);
      const refreshToken = generateRefreshToken(payload);

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          tenant: {
            id: tenant.id,
            name: tenant.name,
            slug: tenant.slug,
            logo: tenant.logo,
            primaryColor: tenant.primaryColor,
            secondaryColor: tenant.secondaryColor,
          },
        },
        token,
        refreshToken,
      };
    }),

  // Logout
  logout: protectedProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ input }) => {
      const { token } = input;
      await blacklistToken(token);
      return { message: 'Logged out successfully' };
    }),

  // Get current user
  me: protectedProcedure
    .query(async ({ ctx }) => {
      const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [ctx.user.id]);
      const user = userResult.rows[0];

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      const tenantResult = await pool.query('SELECT * FROM tenants WHERE id = $1', [user.tenantId]);
      const tenant = tenantResult.rows[0];

      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenant: {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
          logo: tenant.logo,
          primaryColor: tenant.primaryColor,
          secondaryColor: tenant.secondaryColor,
        },
      };
    }),
}); 