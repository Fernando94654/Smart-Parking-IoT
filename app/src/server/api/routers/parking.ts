import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";

export const parkingRouter = createTRPCRouter({
  getAll: publicProcedure.query(async () => {
    const parkings = await db.parking.findMany({
      select: {
        id: true,
        name: true,
        location: true,
      },
    });

    return parkings;
  }),
  getParkingStays: publicProcedure
    .input(z.string())
    .query(async ({ input }) => {
      const stays = await db.stay.findMany({
        where: {
          parkingId: input,
        },
      });
      const users = await db.user.findMany({
        where: { id: { in: stays.map((stay) => stay.userId) } },
      });
      return stays.map((stay) => ({
        ...stay,
        userName:
          users.find((user) => user.id === stay.userId)?.name ?? "Desconocido",
      }));
    }),
  getParkingSlots: publicProcedure
    .input(z.string())
    .query(async ({ input }) => {
      const slots = await db.parkingSlot.findMany({
        where: {
          parkingId: input,
        },
        orderBy: {
          id: "asc",
        },
      });
      return slots;
    }),
});
