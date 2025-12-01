import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";

export const enviromentRouter = createTRPCRouter({
  getTemperatureHistory: publicProcedure.query(async () => {
    const history = await db.sensor.findMany({
      select: {
        date: true,
        type: true,
        reading: true,
      },
      where: {
        type: "temperature",
      },
      orderBy: {
        date: "asc",
      },
    });
    return history;
  }),
});
