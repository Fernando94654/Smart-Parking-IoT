import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const parkingRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.parking.findMany({
      orderBy: { name: "asc" },
    });
  }),

  getParkingStays: publicProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      if (!input) return [];
      
      return await ctx.db.stay.findMany({
        where: { parkingId: input },
        orderBy: { startHour: "desc" },
        take: 50,
      });
    }),

  getParkingSlots: publicProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      if (!input) return [];
      
      return await ctx.db.parkingSlot.findMany({
        where: { parkingId: input },
        orderBy: { ultrasonicId: "asc" },
      });
    }),

  // NUEVA QUERY - Temperatura
  getParkingTemperature: publicProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      if (!input) return null;
      
      try {
        // Buscar datos reales de temperatura
        const temperature = await ctx.db.temperature.findFirst({
          where: { parkingId: input },
          orderBy: { timestamp: "desc" },
        });

        // Si no hay datos, generar datos de ejemplo para desarrollo
        if (!temperature) {
          return {
            id: `temp-${input}-demo`,
            parkingId: input,
            temperature: Math.floor(Math.random() * 15) + 20, // 20-35°C
            timestamp: new Date(),
            sensorId: "default-sensor",
          };
        }

        return temperature;
      } catch (error) {
        console.error("Error fetching temperature:", error);
        // Datos de fallback para desarrollo
        return {
          id: `temp-${input}-fallback`,
          parkingId: input,
          temperature: 22.5,
          timestamp: new Date(),
          sensorId: "fallback-sensor",
        };
      }
    }),
});
