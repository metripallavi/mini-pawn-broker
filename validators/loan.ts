import { z } from "zod";

export const createLoanSchema = z.object({
  customerName: z.string().trim().min(1, "Customer name is required"),

  loanDate: z.string().datetime(),

  loanAmount: z.number().positive("Loan amount must be greater than zero"),

  interestRatePerMonth: z
    .number()
    .positive("Interest rate must be greater than zero"),

  pledgedItemName: z.string().trim().min(1, "Pledged item is required"),

  grossWeight: z.number().positive("Gross weight must be greater than zero"),

  stoneWeight: z.number().min(0),

  estimatedItemValue: z
    .number()
    .positive("Estimated item value must be greater than zero"),

  paymentMode: z.enum(["CASH", "BANK"]),
}).refine(
  (data) => data.stoneWeight <= data.grossWeight,
  {
    message: "Stone weight cannot exceed gross weight",
    path: ["stoneWeight"],
  }
);
