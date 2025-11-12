import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
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
});

