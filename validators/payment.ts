import { z } from "zod";

export const paymentSchema = z.object({
  loanId: z.number().int().positive(),

  paymentDate: z.coerce.date(),

  amount: z.number().positive(),
});

export type PaymentInput = z.infer<typeof paymentSchema>;
