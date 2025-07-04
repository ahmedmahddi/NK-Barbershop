import { servicesRouter } from "@/modules/services/server/procedures";
import { createTRPCRouter } from "../init";
import { teamRouter } from "@/modules/team/server/procedures";
import { bookingRouter } from "@/modules/Bookings/server/procedures";
import { authRouter } from "@/modules/auth/server/procedures";
import { dashboardStatsRouter } from "@/modules/dashboard/server/procedures";

export const appRouter = createTRPCRouter({
  services: servicesRouter,
  team: teamRouter,
  booking: bookingRouter,
  auth: authRouter,
  stats: dashboardStatsRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
