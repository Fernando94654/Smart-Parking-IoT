import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";

export const enviromentRouter = createTRPCRouter({
  getTemperatureHistory: publicProcedure.query(async () => {
    // return only records from the last 10 hours
    const tenHoursAgo = new Date(Date.now() - 10 * 60 * 60 * 1000);
    const history = await db.sensor.findMany({
      select: {
        date: true,
        type: true,
        reading: true,
      },
      where: {
        type: "temperature",
        date: {
          gte: tenHoursAgo,
        },
      },
      orderBy: {
        date: "asc",
      },
    });
    return history;
  }),
  getHumidityHistory: publicProcedure.query(async () => {
    // return only records from the last 10 hours
    const tenHoursAgo = new Date(Date.now() - 10 * 60 * 60 * 1000);
    const history = await db.sensor.findMany({
      select: {
        date: true,
        type: true,
        reading: true,
      },
      where: {
        type: "humidity",
        date: {
          gte: tenHoursAgo,
        },
      },
      orderBy: {
        date: "asc",
      },
    });
    return history;
  }),
});