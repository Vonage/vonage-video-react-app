import { initTRPC } from '@trpc/server';

const { router, procedure } = initTRPC.create();

const trpcRouter = router({
  rpcHello: procedure.query(() => {
    return { message: 'Hello from tRPC!' };
  }),
  rpcGoodbye: procedure.query(() => {
    return { message: 'Goodbye from tRPC!' };
  }),
});

export type AppRouter = typeof trpcRouter;

export default trpcRouter;
