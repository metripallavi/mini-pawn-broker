import { prisma } from "@/lib/prisma";

export async function generateVoucherNumber(): Promise<string> {
  const lastVoucher = await prisma.voucher.findFirst({
    orderBy: {
      id: "desc",
    },
  });

  const nextId = (lastVoucher?.id ?? 0) + 1;

  return `V${nextId.toString().padStart(6, "0")}`;
}
