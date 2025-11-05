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
