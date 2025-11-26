import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    await prisma.$connect();
    
    // Count members in database
    const memberCount = await prisma.fnmember.count();
    const authCount = await prisma.fnauth.count();
    
    return NextResponse.json(
      {
        success: true,
        message: "Database connection successful",
        data: {
          totalMembers: memberCount,
          activatedAccounts: authCount,
          databaseConnected: true,
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Database test error:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: "Database connection failed",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
