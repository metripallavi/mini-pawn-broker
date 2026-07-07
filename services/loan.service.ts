import { prisma } from "@/lib/prisma";
import { Prisma, PaymentMode } from "@prisma/client";

import {
  createLoanVoucher,
  createLoanLedgerEntries,
} from "@/services/accounting.service";

export interface CreateLoanInput {
  customerName: string;
  loanDate: Date;
  loanAmount: number;
  interestRatePerMonth: number;
  pledgedItemName: string;
  grossWeight: number;
  stoneWeight: number;
  estimatedItemValue: number;
  paymentMode: PaymentMode;
}

async function findOrCreateCustomer(
  tx: Prisma.TransactionClient,
  customerName: string
) {
  const trimmedName = customerName.trim();

  const existingCustomer = await tx.customer.findFirst({
    where: {
      name: trimmedName,
    },
  });

  if (existingCustomer) {
    return existingCustomer;
  }

  return tx.customer.create({
    data: {
      name: trimmedName,
    },
  });
}

export async function createLoan(input: CreateLoanInput) {
  return prisma.$transaction(async (tx) => {
    const customer = await findOrCreateCustomer(
      tx,
      input.customerName
    );

    const loan = await tx.loan.create({
      data: {
        loanNumber: null,
        customerId: customer.id,
        loanDate: input.loanDate,
        loanAmount: new Prisma.Decimal(input.loanAmount),
        interestRatePerMonth: new Prisma.Decimal(
          input.interestRatePerMonth
        ),
        pledgedItemName: input.pledgedItemName,
        grossWeight: new Prisma.Decimal(input.grossWeight),
        stoneWeight: new Prisma.Decimal(input.stoneWeight),
        estimatedItemValue: new Prisma.Decimal(
          input.estimatedItemValue
        ),
        paymentMode: input.paymentMode,
      },
    });

    const loanNumber = `LN${loan.id
      .toString()
      .padStart(6, "0")}`;

    const updatedLoan = await tx.loan.update({
      where: {
        id: loan.id,
      },
      data: {
        loanNumber,
      },
      include: {
        customer: true,
      },
    });

    const voucher = await createLoanVoucher(
      tx,
      updatedLoan.id,
      updatedLoan.loanDate
    );

    await createLoanLedgerEntries(
      tx,
      voucher.id,
      updatedLoan.loanAmount,
      updatedLoan.paymentMode
    );

    return updatedLoan;
  });
}
