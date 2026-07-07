import { z } from "zod";

export const receivePaymentSchema = z.object({
  loanId: z.number().int().positive(),

  paymentDate: z.string().datetime(),

  amount: z.number().positive("Payment amount must be greater than zero"),
});
