// ─────────────────────────────────────────────────────────────
//  Email Service — Automated email notifications
// ─────────────────────────────────────────────────────────────
const nodemailer = require("nodemailer");

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Base email template with inline CSS
const emailTemplate = (title, content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
    <div style="background:linear-gradient(135deg,#00d4ff,#7c3aed);padding:30px;text-align:center;">
      <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:800;">AI SaaS CRM</h1>
    </div>
    <div style="padding:40px 30px;">
      <h2 style="margin:0 0 20px 0;color:#0f172a;font-size:22px;">${title}</h2>
      ${content}
    </div>
    <div style="background:#f8fafc;padding:20px 30px;text-align:center;border-top:1px solid #e2e8f0;">
      <p style="margin:0;color:#64748b;font-size:12px;">© ${new Date().getFullYear()} AI SaaS CRM. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

// Send welcome email on registration
const sendWelcomeEmail = async (user) => {
  try {
    const content = `
      <p style="color:#475569;font-size:16px;line-height:1.6;margin:0 0 20px 0;">
        Hi <strong>${user.name}</strong>,
      </p>
      <p style="color:#475569;font-size:16px;line-height:1.6;margin:0 0 20px 0;">
        Welcome to AI SaaS CRM! Your account has been successfully created with the role of <strong>${user.role}</strong>.
      </p>
      <p style="color:#475569;font-size:16px;line-height:1.6;margin:0 0 20px 0;">
        You can now access our AI-powered CRM features including:
      </p>
      <ul style="color:#475569;font-size:16px;line-height:1.8;margin:0 0 20px 20px;">
        <li>AI Lead Scoring (0-100)</li>
        <li>Deal Probability Prediction</li>
        <li>Smart Recommendations</li>
        <li>Real-time Analytics</li>
      </ul>
      <div style="text-align:center;margin:30px 0;">
        <a href="${process.env.CLIENT_URL}/login" style="display:inline-block;background:linear-gradient(135deg,#00d4ff,#7c3aed);color:#ffffff;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:700;font-size:16px;">
          Login to Dashboard
        </a>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: "Welcome to AI SaaS CRM! 🚀",
      html: emailTemplate("Welcome Aboard!", content),
    });

    console.log(`✅ Welcome email sent to ${user.email}`);
  } catch (error) {
    console.error("Email send failed:", error.message);
  }
};

// Send lead follow-up email when score > 70
const sendLeadFollowupEmail = async (lead, assignedUser) => {
  try {
    if (!assignedUser || !assignedUser.email) return;

    const content = `
      <p style="color:#475569;font-size:16px;line-height:1.6;margin:0 0 20px 0;">
        Hi <strong>${assignedUser.name}</strong>,
      </p>
      <p style="color:#475569;font-size:16px;line-height:1.6;margin:0 0 20px 0;">
        A high-value lead has been detected and requires immediate attention!
      </p>
      <div style="background:#f8fafc;border-left:4px solid #10b981;padding:20px;margin:20px 0;border-radius:8px;">
        <p style="margin:0 0 10px 0;color:#0f172a;font-weight:700;font-size:18px;">${lead.name}</p>
        <p style="margin:0 0 8px 0;color:#475569;"><strong>Company:</strong> ${lead.company || "N/A"}</p>
        <p style="margin:0 0 8px 0;color:#475569;"><strong>Email:</strong> ${lead.email}</p>
        <p style="margin:0 0 8px 0;color:#475569;"><strong>Budget:</strong> $${lead.budget?.toLocaleString()}</p>
        <p style="margin:0;color:#10b981;font-weight:700;font-size:20px;">
          🎯 AI Score: ${lead.leadScore}/100 (${lead.leadCategory})
        </p>
      </div>
      <p style="color:#475569;font-size:16px;line-height:1.6;margin:0 0 20px 0;">
        <strong>Recommended Action:</strong> Contact this lead immediately to maximize conversion probability.
      </p>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: assignedUser.email,
      subject: `🔥 High-Value Lead Alert: ${lead.name} (Score: ${lead.leadScore})`,
      html: emailTemplate("High-Value Lead Detected!", content),
    });

    console.log(`✅ Lead follow-up email sent to ${assignedUser.email}`);
  } catch (error) {
    console.error("Email send failed:", error.message);
  }
};

// Send deal won email
const sendDealWonEmail = async (deal, customer) => {
  try {
    if (!customer || !customer.email) return;

    const content = `
      <p style="color:#475569;font-size:16px;line-height:1.6;margin:0 0 20px 0;">
        Congratulations! 🎉
      </p>
      <p style="color:#475569;font-size:16px;line-height:1.6;margin:0 0 20px 0;">
        We're excited to confirm that your deal has been successfully closed.
      </p>
      <div style="background:#f0fdf4;border-left:4px solid #10b981;padding:20px;margin:20px 0;border-radius:8px;">
        <p style="margin:0 0 10px 0;color:#0f172a;font-weight:700;font-size:18px;">${deal.title}</p>
        <p style="margin:0 0 8px 0;color:#475569;"><strong>Value:</strong> $${deal.value?.toLocaleString()} ${deal.currency}</p>
        <p style="margin:0;color:#10b981;font-weight:700;">Status: Closed Won ✓</p>
      </div>
      <p style="color:#475569;font-size:16px;line-height:1.6;margin:0 0 20px 0;">
        Our team will be in touch shortly to discuss next steps and onboarding.
      </p>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: customer.email,
      subject: `🎉 Deal Closed: ${deal.title}`,
      html: emailTemplate("Deal Successfully Closed!", content),
    });

    console.log(`✅ Deal won email sent to ${customer.email}`);
  } catch (error) {
    console.error("Email send failed:", error.message);
  }
};

// Send ticket resolved email
const sendTicketResolvedEmail = async (ticket, customer) => {
  try {
    if (!customer || !customer.email) return;

    const resolutionTime = ticket.resolutionTimeHours
      ? `${Math.round(ticket.resolutionTimeHours)} hours`
      : "N/A";

    const content = `
      <p style="color:#475569;font-size:16px;line-height:1.6;margin:0 0 20px 0;">
        Hi <strong>${customer.name}</strong>,
      </p>
      <p style="color:#475569;font-size:16px;line-height:1.6;margin:0 0 20px 0;">
        Great news! Your support ticket has been resolved.
      </p>
      <div style="background:#f0f9ff;border-left:4px solid #00d4ff;padding:20px;margin:20px 0;border-radius:8px;">
        <p style="margin:0 0 10px 0;color:#0f172a;font-weight:700;font-size:18px;">${ticket.title}</p>
        <p style="margin:0 0 8px 0;color:#475569;"><strong>Priority:</strong> ${ticket.priority}</p>
        <p style="margin:0 0 8px 0;color:#475569;"><strong>Resolution Time:</strong> ${resolutionTime}</p>
        <p style="margin:0;color:#00d4ff;font-weight:700;">Status: Resolved ✓</p>
      </div>
      <p style="color:#475569;font-size:16px;line-height:1.6;margin:0 0 20px 0;">
        If you have any further questions or concerns, please don't hesitate to reach out.
      </p>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: customer.email,
      subject: `✅ Ticket Resolved: ${ticket.title}`,
      html: emailTemplate("Support Ticket Resolved", content),
    });

    console.log(`✅ Ticket resolved email sent to ${customer.email}`);
  } catch (error) {
    console.error("Email send failed:", error.message);
  }
};

module.exports = {
  sendWelcomeEmail,
  sendLeadFollowupEmail,
  sendDealWonEmail,
  sendTicketResolvedEmail,
};
