import cloudinary from "../config/cloudinary";

/**Returns "valid" if password passes all tests otherwise returns the reason for failure. */
export function passwordCheck(password: string) {
  if (!/[a-z]/.test(password)) {
    return "Password must contain at least one lowercase letter";
  }
  // if (!/[A-Z]/.test(password)) {
  //   return "Password must contain at least one uppercase letter";
  // }
  if (!/[0-9]/.test(password)) {
    return "Password must contain at least one number";
  }
  // if (!/[`!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/.test(password)) {
  //   return "Password must contain at least one special character";
  // }
  return "valid";
}

/**Upload image on imagePath to cloudinary and returns image url */
export async function upload2cloud(imagePath: string | undefined) {
  if (!imagePath) return "";
  const result = await cloudinary.uploader.upload(imagePath);
  const imageUrl = result.secure_url;
  return imageUrl;
}

/**Deletes image in imageUrl from cloudinary */
export async function deleteFromCloud(imageUrl: string) {
  try {
    const publicId = imageUrl.split("/").at(-1)?.split(".")[0] as string;
    const deletionResponse = await cloudinary.uploader.destroy(publicId);
    if (deletionResponse.result === "ok") {
      console.log("Image deleted successfully");
    } else {
      console.warn("Image deletion failed", deletionResponse);
    }
  } catch (error) {
    console.warn("Error deleting image", error);
  }
}

/**Command to update user fields in database if fields not present */
export async function runCommand() {
  const User = await import("../models/users");
  const users = await User.default.find();
  for (const user of users) {
    if (!user.cart) {
      user.cart = [];
      await user.save();
    }
  }
  console.log("Command run successfully");
}
