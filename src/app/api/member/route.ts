import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get member data with all relations
    const member = await prisma.fnmember.findUnique({
      where: { id: session.user.id },
      include: {
        auth: {
          select: {
            username: true,
            email: true,
            verified: true,
            lastLogin: true,
          }
        },
        profile: true,
        barcode: true,
        family: true,
      },
    });

    if (!member) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        data: member 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get member error:", error);

    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
