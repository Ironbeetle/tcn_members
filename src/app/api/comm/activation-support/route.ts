import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)
const SUPPORT_EMAIL = "tcntechsupport@tataskweyak.ca"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const name = String(body?.name || "").trim()
    const email = String(body?.email || "").trim()
    const message = String(body?.message || "").trim()

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email, and message are required" }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Please provide a valid email address" }, { status: 400 })
    }

    const { error } = await resend.emails.send({
      from: `${process.env.RESEND_FROM_NAME || "TCN Support"} <${process.env.RESEND_FROM_EMAIL}>`,
      to: [SUPPORT_EMAIL],
      replyTo: email,
      subject: `Activation help request from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
          <h2 style="margin: 0 0 12px;">Activation support request</h2>
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
          <p style="margin-top: 16px; font-size: 12px; color: #6b7280;">Sent on ${new Date().toISOString()}</p>
        </div>
      `,
    })

    if (error) {
      console.error("Activation support email error:", error)
      return NextResponse.json({ error: "Failed to send support request" }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Activation support handler error:", error)
    return NextResponse.json({ error: "Failed to send support request" }, { status: 500 })
  }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}
