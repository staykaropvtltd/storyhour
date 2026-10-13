import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, enquiryType, message, honeypot } = body || {};

    // 1. Anti-spam honeypot detection
    if (honeypot) {
      return NextResponse.json(
        { error: "Spam detected." },
        { status: 400 }
      );
    }

    // 2. Server-side validation
    const trimmedName = typeof name === "string" ? name.trim() : "";
    const trimmedEmail = typeof email === "string" ? email.trim() : "";
    const trimmedPhone = typeof phone === "string" ? phone.trim() : "";
    const trimmedType = typeof enquiryType === "string" ? enquiryType.trim() : "General Enquiry";
    const trimmedMessage = typeof message === "string" ? message.trim() : "";

    if (!trimmedName || trimmedName.length < 2) {
      return NextResponse.json(
        { error: "Please enter a valid name (at least 2 characters)." },
        { status: 422 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 422 }
      );
    }

    if (!trimmedMessage || trimmedMessage.length < 10) {
      return NextResponse.json(
        { error: "Please enter a message with at least 10 characters." },
        { status: 422 }
      );
    }

    // 3. Structured enquiry payload
    const enquiry = {
      name: trimmedName,
      email: trimmedEmail,
      phone: trimmedPhone,
      enquiryType: trimmedType,
      message: trimmedMessage,
      receivedAt: new Date().toISOString(),
    };

    // Log structured message for audit and operations
    console.log("[StoryHour Contact API] New Enquiry Received:", enquiry);

    // 4. Provider Dispatch Check (Resend REST API)
    let delivered = false;
    if (process.env.RESEND_API_KEY) {
      try {
        const toEmail = process.env.CONTACT_TO_EMAIL || "contact@storyhour.co.uk";
        const emailRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          signal: AbortSignal.timeout(8000),
          body: JSON.stringify({
            from: "StoryHour Contact <onboarding@resend.dev>",
            to: [toEmail],
            reply_to: trimmedEmail,
            subject: `[StoryHour Enquiry] ${trimmedType} from ${trimmedName}`,
            text: `Name: ${trimmedName}\nEmail: ${trimmedEmail}\nPhone: ${trimmedPhone || "N/A"}\nType: ${trimmedType}\n\nMessage:\n${trimmedMessage}`,
          }),
        });
        delivered = emailRes.ok;
      } catch (err) {
        console.error("[StoryHour Contact API] Resend dispatch failed:", err);
      }
    }

    return NextResponse.json({
      success: true,
      delivered,
      message: delivered
        ? "Your enquiry has been delivered to our team."
        : "Your enquiry has been received and logged.",
    });
  } catch (error) {
    console.error("[StoryHour Contact API] Error processing enquiry:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
