import { initTRPC, TRPCError } from '@trpc/server';
import { type FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import superjson from 'superjson';
import { verifyToken } from '@/lib/token-verifier';

interface CreateContextOptions {
  user?: {
    id: string;
    email: string;
    role: string;
    tenantId: string;
  } | null;
}

const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    user: opts.user,
  };
};

export const createTRPCContext = async (opts: FetchCreateContextFnOptions) => {
  const { req } = opts;
  
  // Extract token from Authorization header
  const authHeader = req.headers.get('authorization');
  let user = null;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const decoded = await verifyToken(token);
      user = decoded;
    } catch (error) {
      // Token verification failed, but we'll continue with null user
      console.warn('Token verification failed:', error);
    }
  }

  return createInnerTRPCContext({
    user,
  });
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
});

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

const hasRole = (allowedRoles: string[]) =>
  t.middleware(({ ctx, next }) => {
    if (!ctx.user || !allowedRoles.includes(ctx.user.role)) {
      throw new TRPCError({ 
        code: 'FORBIDDEN',
        message: 'Insufficient permissions'
      });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  });

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);
export const adminProcedure = protectedProcedure.use(hasRole(['SUPER_ADMIN', 'TENANT_ADMIN']));
export const managerProcedure = protectedProcedure.use(hasRole(['SUPER_ADMIN', 'TENANT_ADMIN', 'MANAGER']));
