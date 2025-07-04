// src/trpc/dashboardStats.ts
import { Service } from "@/payload-types";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";

export const dashboardStatsRouter = createTRPCRouter({
  getStats: baseProcedure.query(async ({ ctx }) => {
    // Fetch necessary data
    const [bookings, barbers] = await Promise.all([
      ctx.db.find({ collection: "bookings", depth: 1 }),
      ctx.db.find({ collection: "team", depth: 0 }),
    ]);

    // Calculate stats
    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const todayEnd = new Date(now.setHours(23, 59, 59, 999));

    let totalRevenue = 0;
    let todaysRevenue = 0;
    let totalAppointments = 0;
    let upcomingAppointments = 0;
    let todaysAppointments = 0;
    const serviceCounts: Record<string, number> = {};

    bookings.docs.forEach(booking => {
      const start = new Date(booking.start);
      const price = (booking.service as Service)?.price || 0;

      // Count appointments
      totalAppointments++;
      if (start > now) upcomingAppointments++;
      if (start >= todayStart && start <= todayEnd) todaysAppointments++;

      // Calculate revenue
      if (["confirmed", "completed"].includes(booking.status)) {
        totalRevenue += price;
        if (start >= todayStart && start <= todayEnd) todaysRevenue += price;
      }

      // Count services
      const serviceName = (booking.service as Service)?.name || "Unknown";
      serviceCounts[serviceName] = (serviceCounts[serviceName] || 0) + 1;
    });

    // Get top services
    const popularServices = Object.entries(serviceCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name, bookings]) => ({ name, bookings }));

    return {
      totalRevenue,
      todaysRevenue,
      totalAppointments,
      upcomingAppointments,
      todaysAppointments,
      popularServices,
      barberCount: barbers.docs.length,
    };
  }),
});
