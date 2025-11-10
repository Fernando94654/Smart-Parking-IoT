import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { parkingRouter } from "~/server/api/routers/parking";
import { enviromentRouter } from "./routers/enviroment";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  parking: parkingRouter,
  environment: enviromentRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
