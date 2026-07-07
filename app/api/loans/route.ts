import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { createLoanSchema } from "@/validators/loan";
import { createLoan } from "@/services/loan.service";
import { PaymentMode } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validatedData = createLoanSchema.parse(body);

    const loan = await createLoan({
      customerName: validatedData.customerName,
      loanDate: new Date(validatedData.loanDate),
      loanAmount: validatedData.loanAmount,
      interestRatePerMonth: validatedData.interestRatePerMonth,
      pledgedItemName: validatedData.pledgedItemName,
      grossWeight: validatedData.grossWeight,
      stoneWeight: validatedData.stoneWeight,
      estimatedItemValue: validatedData.estimatedItemValue,
      paymentMode: validatedData.paymentMode as PaymentMode,
    });

    return NextResponse.json(
      {
        success: true,
        data: loan,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          errors: error.flatten(),
        },
        { status: 400 }
      );
    }

    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
