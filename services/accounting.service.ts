import {
  EntryType,
  PaymentMode,
  Prisma,
  VoucherType,
} from "@prisma/client";

export async function createLoanVoucher(
  tx: Prisma.TransactionClient,
  loanId: number,
  voucherDate: Date
) {
  const voucher = await tx.voucher.create({
    data: {
      voucherNumber: null,
      voucherDate,
      voucherType: VoucherType.LOAN,
      loanId,
    },
  });

  const voucherNumber =
    "V" + voucher.id.toString().padStart(6, "0");

  return tx.voucher.update({
    where: {
      id: voucher.id,
    },
    data: {
      voucherNumber,
    },
  });
}

export async function createPaymentVoucher(
  tx: Prisma.TransactionClient,
  paymentId: number,
  voucherDate: Date
) {
  const voucher = await tx.voucher.create({
    data: {
      voucherNumber: null,
      voucherDate,
      voucherType: VoucherType.PAYMENT,
      paymentId,
    },
  });

  const voucherNumber =
    "V" + voucher.id.toString().padStart(6, "0");

  return tx.voucher.update({
    where: {
      id: voucher.id,
    },
    data: {
      voucherNumber,
    },
  });
}

export async function createLoanLedgerEntries(
  tx: Prisma.TransactionClient,
  voucherId: number,
  loanAmount: Prisma.Decimal,
  paymentMode: PaymentMode
) {
  const creditAccount =
    paymentMode === PaymentMode.CASH
      ? "Cash"
      : "Bank";

  await tx.ledgerEntry.createMany({
    data: [
      {
        voucherId,
        accountName: "Loan Receivable",
        entryType: EntryType.DEBIT,
        amount: loanAmount,
      },
      {
        voucherId,
        accountName: creditAccount,
        entryType: EntryType.CREDIT,
        amount: loanAmount,
      },
    ],
  });
}

export async function createPaymentLedgerEntries(
  tx: Prisma.TransactionClient,
  voucherId: number,
  amount: Prisma.Decimal,
  paymentMode: PaymentMode
) {
  const debitAccount =
    paymentMode === PaymentMode.CASH
      ? "Cash"
      : "Bank";

  await tx.ledgerEntry.createMany({
    data: [
      {
        voucherId,
        accountName: debitAccount,
        entryType: EntryType.DEBIT,
        amount,
      },
      {
        voucherId,
        accountName: "Loan Receivable",
        entryType: EntryType.CREDIT,
        amount,
      },
    ],
  });
}
