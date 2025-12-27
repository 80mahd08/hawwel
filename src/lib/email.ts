import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
  // ⚡ CRITICAL FIX: Force IPv4.
  // Many cloud containers (Render, Docker) fail with IPv6 (default) for Gmail.
  family: 4, 
  
  // Debugging: This will log SMTP traffic to your console
  logger: true,
  debug: true,

  // Performance & Resilience settings
  pool: true, 
  maxConnections: 1, 
  rateLimit: 5, 
  connectionTimeout: 20000, // Increased to 20s
  greetingTimeout: 20000,
  socketTimeout: 20000,
} as any);

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    const info = await transporter.sendMail({
      from: `"Hawwel" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    return info;
  } catch (error) {
    throw error;
  }
}

export function getBookingRequestTemplate({
  ownerName,
  buyerName,
  houseTitle,
  startDate,
  endDate,
}: {
  ownerName: string;
  buyerName: string;
  houseTitle: string;
  startDate: string;
  endDate: string;
}) {
  return `
    <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
      <h2>New Booking Request 🏠</h2>
      <p>Hello <strong>${ownerName}</strong>,</p>
      <p>Good news! <strong>${buyerName}</strong> has sent a request to book your property <strong>${houseTitle}</strong>.</p>
      <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Dates:</strong> ${startDate} - ${endDate}</p>
      </div>
      <p>Please visit your dashboard to Accept or Reject this request.</p>
      <p>Best regards,<br/>The Hawwel Team</p>
    </div>
  `;
}

export function getStatusUpdateTemplate({
  userName,
  houseTitle,
  status, // approved or rejected
  startDate,
  endDate,
  telephone, // only for approved
}: {
  userName: string;
  houseTitle: string;
  status: string;
  startDate: string;
  endDate: string;
  telephone?: string;
}) {
  const isApproved = status === "approved";
  const title = isApproved ? "Booking Approved! 🎉" : "Booking Update ℹ️";
  const statusColor = isApproved ? "#22c55e" : "#ef4444";

  return `
    <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
      <h2>${title}</h2>
      <p>Hello <strong>${userName}</strong>,</p>
      <p>Your booking request for <strong>${houseTitle}</strong> has been <strong style="color: ${statusColor}; text-transform: uppercase;">${status}</strong>.</p>
      
      <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Property:</strong> ${houseTitle}</p>
        <p style="margin: 0;"><strong>Dates:</strong> ${startDate} - ${endDate}</p>
        ${isApproved && telephone ? `<p style="margin: 5px 0 0 0;"><strong>Owner's Phone:</strong> ${telephone}</p>` : ""}
      </div>

      ${isApproved 
        ? `<p>You can now prepare for your stay! If you have any questions, feel free to contact the owner.</p>` 
        : `<p>We're sorry this request didn't work out. Feel free to browse other available properties on Hawwel.</p>`
      }
      
      <p>Best regards,<br/>The Hawwel Team</p>
    </div>
  `;
}
