import nodemailer from "nodemailer";

// Create a Nodemailer transporter using SMTP
const transporter = nodemailer.createTransport({
  host: "smtp.example.com",
  port: 587, // SMTP port
  secure: false, // true for 465, false for other ports
  auth: {
    user: "your_smtp_username",
    pass: "your_smtp_password",
  },
});

// Function to send order details email
export async function sendOrderDetailsEmail(order: any) {
  try {
    // Construct email content
    const mailOptions = {
      from: "your_email@example.com", // Sender address
      to: order.customerEmail, // Recipient address
      subject: "Order Confirmation", // Subject line
      html: `<p>Dear ${order.customerName},</p><p>Thank you for your order. Here are the details:</p><p>Order ID: ${order._id}</p><p>Items: ${order.items}</p><p>Total Amount: ${order.totalAmount}</p>`, // Email body
    };

    // Send email
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
}
