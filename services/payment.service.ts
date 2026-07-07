import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { calculateInterest } from "@/lib/interest";
import {
  createPaymentVoucher,
  createPaymentLedgerEntries,
} from "@/services/accounting.service";

export interface ReceivePaymentInput {
  loanId: number;
  paymentDate: Date;
  amount: number;
}

export async function receivePayment(
  input: ReceivePaymentInput
) {
  return prisma.$transaction(async (tx) => {
    const loan = await tx.loan.findUnique({
      where: {
        id: input.loanId,
      },
      include: {
        payments: true,
      },
    });

    if (!loan) {
      throw new Error("Loan not found");
    }

    const principalPaid = loan.payments.reduce(
      (sum, payment) => sum + Number(payment.principalPaid),
      0
    );

    const interestPaid = loan.payments.reduce(
      (sum, payment) => sum + Number(payment.interestPaid),
      0
    );

    const principalOutstanding =
      Number(loan.loanAmount) - principalPaid;

    const interest = calculateInterest(
      principalOutstanding,
      Number(loan.interestRatePerMonth),
      loan.loanDate,
      input.paymentDate
    );

    const interestOutstanding = Math.max(
      0,
      interest.interest - interestPaid
    );

    let remainingPayment = input.amount;

    const interestPayment = Math.min(
      remainingPayment,
      interestOutstanding
    );

    remainingPayment -= interestPayment;

    const principalPayment = Math.min(
      remainingPayment,
      principalOutstanding
    );

    const payment = await tx.payment.create({
      data: {
        loanId: loan.id,
        paymentDate: input.paymentDate,
        amount: new Prisma.Decimal(input.amount),
        interestPaid: new Prisma.Decimal(
          interestPayment
        ),
        principalPaid: new Prisma.Decimal(
          principalPayment
        ),
      },
    });

    const voucher = await createPaymentVoucher(
      tx,
      payment.id,
      input.paymentDate
    );

    await createPaymentLedgerEntries(
      tx,
      voucher.id,
      new Prisma.Decimal(input.amount),
      loan.paymentMode
    );

    return {
      paymentId: payment.id,

      interestPaid: interestPayment,

      principalPaid: principalPayment,

      principalOutstanding:
        principalOutstanding - principalPayment,

      interestOutstanding:
        interestOutstanding - interestPayment,

      totalOutstanding:
        principalOutstanding -
        principalPayment +
        (interestOutstanding - interestPayment),
    };
  });
}
