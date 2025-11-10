import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";

export const enviromentRouter = createTRPCRouter({
  getTemperatureHistory: publicProcedure.query(async () => {
    const history = await db.parkingData.findMany({
      select: {
        date: true,
        temperature: true,
      },
      orderBy: {
        date: "asc",
      },
    });
    return history;
  }),
});
