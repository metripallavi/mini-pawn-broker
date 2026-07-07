import { prisma } from "@/lib/prisma";

export async function getLoanDetails(loanId: number) {
  const loan = await prisma.loan.findUnique({
    where: {
      id: loanId,
    },
    include: {
      customer: true,
      payments: {
        orderBy: {
          paymentDate: "asc",
        },
      },
    },
  });

  if (!loan) {
    throw new Error("Loan not found");
  }

  const today = new Date();

  const milliseconds =
    today.getTime() - loan.loanDate.getTime();

  const daysElapsed = Math.max(
    0,
    Math.floor(milliseconds / (1000 * 60 * 60 * 24))
  );

  const principal = Number(loan.loanAmount);

  const monthlyRate =
    Number(loan.interestRatePerMonth) / 100;

  const interestAccrued =
    principal * monthlyRate * (daysElapsed / 30);

  const principalPaid = loan.payments.reduce(
    (sum, payment) => sum + Number(payment.principalPaid),
    0
  );

  const interestPaid = loan.payments.reduce(
    (sum, payment) => sum + Number(payment.interestPaid),
    0
  );

  const principalOutstanding =
    principal - principalPaid;

  const interestOutstanding =
    Math.max(0, interestAccrued - interestPaid);

  const totalOutstanding =
    principalOutstanding + interestOutstanding;

  return {
    loanId: loan.id,
    loanNumber: loan.loanNumber,

    customer: loan.customer,

    loanDate: loan.loanDate,

    loanAmount: principal,

    interestRatePerMonth: Number(
      loan.interestRatePerMonth
    ),

    pledgedItemName: loan.pledgedItemName,

    grossWeight: Number(loan.grossWeight),

    stoneWeight: Number(loan.stoneWeight),

    estimatedItemValue: Number(
      loan.estimatedItemValue
    ),

    paymentMode: loan.paymentMode,

    daysElapsed,

    interestAccrued: Number(
      interestAccrued.toFixed(2)
    ),

    interestPaid,

    interestOutstanding: Number(
      interestOutstanding.toFixed(2)
    ),

    principalPaid,

    principalOutstanding,

    totalOutstanding: Number(
      totalOutstanding.toFixed(2)
    ),

    payments: loan.payments,
  };
}
