import { postRouter } from "@/server/api/routers/post";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { accountRouter } from "./routers/account";
import { analysisRouter } from "./routers/analysis";
import { attendanceRouter } from "./routers/attendance";
import { campaignRouter } from "./routers/campaign";
import { streamIoRouter } from "./routers/streamIo";
import { stripeRouter } from "./routers/stripe";
import { VapiRouter } from "./routers/vapi";
import { vconsRouter } from "./routers/vcon";
import { webinarRouter } from "./routers/webinar";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  account: accountRouter,
  webinar: webinarRouter,
  stripe: stripeRouter,
  attendance: attendanceRouter,
  streamIo: streamIoRouter,
  vapi: VapiRouter,
  vcon: vconsRouter,
  analysis: analysisRouter,
  campaign: campaignRouter
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
