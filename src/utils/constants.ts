export const baseUrl =
  process.env.NODE_ENV === "development"
    ? `http://localhost:${process.env.PORT}`
    : process.env.SERVER_URL;

/** Generates an HTML email verification message using the user's name and id for a signup with Eat-and-Go. */
export const getEmailVerificationText = (name: string, userId: string) => {
  const message = `
  <p>Hi ${name},</p>
  <p>Thank you for signing up with Eat-and-Go</p>
  <p>Click the button to verify your email address</p> <br>
  <a href="${baseUrl}/auth/email-verify/${userId}">
    <button style="background-color: blue; border-radius: 4px; border: none; color: white; padding: 8px 12px;">
      Verify Email
    </button>
  </a>
  `;
  return message;
};

export const getResetPasswordText = (name: string, userId: string) => {
  const message = `
  <p>Hi ${name},</p>
  <p>Click the button to reset your password</p> <br>
  <a href="${process.env.CLIENT_URL}/reset-password/${userId}">
    <button style="background-color: blue; border-radius: 4px; border: none; color: white; padding: 8px 12px;">
      Reset Password
    </button>
  </a>
  `;
  return message;
};
