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
    // Fetch parkings with slots and the latest parkingData entry
    // Cast ctx.db to any to avoid TS issues if the generated Prisma client typings
    // are not available / in sync locally. This is low-risk for a dashboard template.
    getParkingStays: publicProcedure.input(
        z.string()
    ).query(async ({ input }) => {
        const stays = await db.stay.findMany({
            where: {
                parkingId: input,
            },
        });
        return stays;
    }),
    getParkingSlots: publicProcedure.input(
        z.string()
    ).query(async ({ input }) => {
        const slots = await db.parkingSlot.findMany({
            where: {
                parkingId: input,
            },
        });
        return slots;
    }),
});
