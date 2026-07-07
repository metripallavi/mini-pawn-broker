import { NextRequest, NextResponse } from "next/server";

import { getLoanDetails } from "@/services/loan-details.service";

export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const { id } = await context.params;

    const loan = await getLoanDetails(Number(id));

    return NextResponse.json({
      success: true,
      data: loan,
    });
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
        status: 404,
      }
    );
  }
}
