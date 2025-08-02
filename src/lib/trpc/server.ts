import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { ZodError } from 'zod';
import { verifyToken } from '@/lib/auth';

export interface CreateContextOptions {
  headers: Headers;
  user?: {
    id: string;
    email: string;
    role: string;
    tenantId: string;
  };
}

const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    headers: opts.headers,
    user: opts.user,
  };
};

export const createTRPCContext = async (opts: { req: Request }) => {
  const { req } = opts;
  
  // Get token from Authorization header
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  
  let user = undefined;
  if (token) {
    try {
      const decoded = await verifyToken(token);
      user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        tenantId: decoded.tenantId,
      };
    } catch {
      // Token is invalid, but we don't throw here
      // Let individual procedures handle authentication
    }
  }

  return createInnerTRPCContext({
    headers: req.headers,
    user,
  });
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

// Middleware to check if user is authenticated
const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

// Middleware to check if user has specific role
const hasRole = (allowedRoles: string[]) =>
  t.middleware(({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
    
    if (!allowedRoles.includes(ctx.user.role)) {
      throw new TRPCError({ code: 'FORBIDDEN' });
    }
    
    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  });

export const protectedProcedure = t.procedure.use(isAuthed);
export const adminProcedure = protectedProcedure.use(hasRole(['SUPER_ADMIN', 'TENANT_ADMIN']));
export const managerProcedure = protectedProcedure.use(hasRole(['SUPER_ADMIN', 'TENANT_ADMIN', 'MANAGER'])); 