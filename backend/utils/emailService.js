const sendEmail = async (to, subject, html) => {
  console.log(`[Email] To: ${to} | Subject: ${subject}`);
};
const sendWelcomeEmail = async (user) => {
  await sendEmail(user.email, "Welcome to AI SaaS CRM", `<h1>Welcome ${user.name}!</h1>`);
};
const sendTicketResolvedEmail = async (ticket, customer) => {
  if (customer?.email) {
    await sendEmail(customer.email, "Ticket Resolved", `<p>Your ticket "${ticket.title}" has been resolved.</p>`);
  }
};
module.exports = { sendEmail, sendWelcomeEmail, sendTicketResolvedEmail };
