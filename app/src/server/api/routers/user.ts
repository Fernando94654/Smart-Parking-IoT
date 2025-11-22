import { get } from "http";
import { z } from "zod";

import { createTRPCRouter, publicProcedure, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";

export const userRouter = createTRPCRouter({
  getUserNameById: publicProcedure
    .input(z.string())
    .query(async ({ input }) => {
      const user = await db.user.findUnique({
        where: { id: input },
      });
      return user?.name;
    }),
  updateUserPlate: protectedProcedure
    .input(
      z.object({
        newPlateNumber: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const plate = input.newPlateNumber.toLowerCase().replace(/-/g, "");
      await db.user.update({
        where: { id: ctx.session.user.id },
        data: { plateNumber: plate },
      });
    }),
    getUserPlate: protectedProcedure
    .query(async ({ ctx }) => {
      const user = await db.user.findUnique({
        where: { id: ctx.session.user.id },
      });
      return user?.plateNumber?.toUpperCase();
    }),
});

