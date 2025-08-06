import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Simple warm-up endpoint to prevent cold starts
    return NextResponse.json({
      status: "warm",
      timestamp: new Date().toISOString(),
      message: "Server is ready to handle requests",
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        message: "Server warm-up failed",
      },
      { status: 500 }
    );
  }
}
