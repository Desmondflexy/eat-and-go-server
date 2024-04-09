export const BASE_URL =
  process.env.NODE_ENV === "development"
    ? `http://localhost:${process.env.PORT}`
    : process.env.SERVER_URL;

/** Generates an HTML email verification message using the user's name and id for a signup with Eat-and-Go. */
export const getEmailVerificationText = (name: string, userId: string) => {
  const message = `
  <p>Hi ${name},</p>
  <p>Thank you for signing up with Eat-and-Go</p>
  <p>Click the button to verify your email address</p> <br>
  <a href="${BASE_URL}/auth/email-verify/${userId}">
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
  </a> <br>
  <p>Note that this link will expire after 2hrs.</p>
  `;
  return message;
};

export const getProfileUpdateText = (name: string) => {
  const message = `
  <p>Hi ${name},</p>
  <p>Your profile has been updated successfully.</p>
  <p>If you did not make this change, please secure your account immediately.</p>
  <p>Thank you for using Eat-and-Go</p>
  `;
  return message;
};
