const alphabetsLower = /[a-z]/;
const alphabetsUpper = /[A-Z]/;
const numbers = /[0-9]/;
const specialChars = /[`!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/;

/**Returns "valid" if password passes all tests otherwise returns the reason for failure. */
export function passwordCheck(password: string) {
  if (!alphabetsLower.test(password)) {
    return "Password must contain at least one lowercase letter";
  }
  if (!alphabetsUpper.test(password)) {
    return "Password must contain at least one uppercase letter";
  }
  if (!numbers.test(password)) {
    return "Password must contain at least one number";
  }
  if (!specialChars.test(password)) {
    return "Password must contain at least one special character";
  }
  return "valid";
}
