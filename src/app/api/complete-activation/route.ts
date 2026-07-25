import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId } = await request.json()

    if (userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Update member activation status to ACTIVATED
    await prisma.fnmember.update({
      where: { id: userId },
      data: { activated: "ACTIVATED" }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Complete activation error:", error)
    return NextResponse.json(
      { error: "Failed to complete activation" },
      { status: 500 }
    )
  }
}
