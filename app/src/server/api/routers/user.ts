import { get } from "http";
import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";
import { supabaseAdmin } from "~/server/supabaseAdmin";

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
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const plate = input.newPlateNumber.toLowerCase().replace(/-/g, "");
      await db.user.update({
        where: { id: ctx.session.user.id },
        data: { plateNumber: plate },
      });
    }),
  getUserPlate: protectedProcedure.query(async ({ ctx }) => {
    const user = await db.user.findUnique({
      where: { id: ctx.session.user.id },
    });
    return user?.plateNumber?.toUpperCase();
  }),
  getUserStays: protectedProcedure.query(async ({ ctx }) => {
    const stays = await db.stay.findMany({
      where: { userId: ctx.session.user.id },
    });
    if (stays.length === 0) return [];
    const users = await db.user.findMany({
      where: { id: { in: stays.map((stay) => stay.userId) } },
    });
    return stays.map((stay) => ({
      ...stay,
      userName:
        users.find((user) => user.id === stay.userId)?.name ?? "Desconocido",
    }));
  }),
  getMyRole: protectedProcedure.query(async ({ ctx }) => {
    const user = await db.user.findUnique({
      where: { id: ctx.session.user.id },
    });
    return user?.role ?? null;
  }),
  getPaymentMethods: protectedProcedure.query(async ({ ctx }) => {
    const methods = await db.paymentMethod.findMany({
      where: { userId: ctx.session.user.id },
    });
    return methods;
  }),
  addPaymentMethod: protectedProcedure
    .input(
      z.object({
        cardNumber: z.string(),
        expiry: z.string(),
        cvv: z.string(),
        cardHolder: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await db.paymentMethod.create({
        data: {
          userId: ctx.session.user.id,
          cardNumber: input.cardNumber,
          cardHolder: input.cardHolder,
          expiryDate: input.expiry,
          cvv: input.cvv,
        },
      });
    }),
  deletePaymentMethod: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // ensure the method belongs to the user before deleting
      const pm = await db.paymentMethod.findUnique({ where: { id: input.id } });
      if (!pm || pm.userId !== ctx.session.user.id) {
        throw new Error("Método no encontrado o permiso denegado");
      }
      await db.paymentMethod.delete({ where: { id: input.id } });
    }),
  getImageUrl: protectedProcedure.input(z.string()).query(async ({ input }) => {
    const { data, error } = await supabaseAdmin.storage
      .from("images")
      .createSignedUrl(input, 3600); // URL valid for 1 hour
    if (error) return null;
    return data?.signedUrl || null;
  }),
  getTotalUsers: publicProcedure.query(async () => {
    const count = await db.user.count();
    return count;
  }),
});
