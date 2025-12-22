import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { sendEmail } from "@/lib/email";

export async function GET() {
  try {
    const user = await currentUser();
    
    if (!user || !user.emailAddresses?.[0]?.emailAddress) {
      return NextResponse.json({ error: "Please log in to test email." }, { status: 401 });
    }

    const email = user.emailAddresses[0].emailAddress;
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    if (!emailUser || !emailPass) {
      return NextResponse.json({ 
        error: "Missing EMAIL_USER or EMAIL_PASS in environment variables.",
        suggestion: "Add your Gmail and App Password to your .env.local file."
      }, { status: 500 });
    }

    const info = await sendEmail({
      to: email,
      subject: "Test Email from Hawwel (Nodemailer) 📧",
      html: `
        <div style="font-family: sans-serif;">
          <h1>It works! 🎉</h1>
          <p>This email was sent using Nodemailer and Gmail.</p>
          <p>Sent to: <strong>${email}</strong></p>
        </div>
      `,
    });

    return NextResponse.json({ 
      success: true, 
      message: `Test email sent to ${email}`, 
      info 
    });

  } catch (error: unknown) {
    return NextResponse.json({ 
      error: "Internal Error", 
      details: (error as Error)?.message,
      stack: (error as Error)?.stack
    }, { status: 500 });
  }
}
