import { NextRequest, NextResponse } from "next/server";

import { paymentSchema } from "@/validators/payment";
import { receivePayment } from "@/services/payment.service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const data = paymentSchema.parse(body);

    const payment = await receivePayment(data);

    return NextResponse.json(
      {
        success: true,
        data: payment,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      {
        status: 400,
      }
    );
  }
}
