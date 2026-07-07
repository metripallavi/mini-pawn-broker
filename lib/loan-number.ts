import { prisma } from "@/lib/prisma";

export async function generateLoanNumber(): Promise<string> {
  const lastLoan = await prisma.loan.findFirst({
    orderBy: {
      id: "desc",
    },
  });

  const nextId = (lastLoan?.id ?? 0) + 1;

  return `LN${nextId.toString().padStart(6, "0")}`;
}
