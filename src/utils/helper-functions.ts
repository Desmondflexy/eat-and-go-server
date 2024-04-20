import cloudinary from "../config/cloudinary";
import Order from "../models/order";
import { IUser } from "../models/users";

/**Returns "valid" if password passes all tests otherwise returns the reason for failure. */
export function passwordCheck(password: string) {
  if (!/[a-z]/.test(password)) {
    return "Password must contain at least one lowercase letter";
  }
  if (!/[0-9]/.test(password)) {
    return "Password must contain at least one number";
  }
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

export async function generateOrderNo() {
  let orderNo = Math.floor(Math.random() * 10000000000);
  let user = await Order.findOne({ orderNo });
  while (user) {
    orderNo = Math.floor(Math.random() * 10000000000);
    user = await Order.findOne({ orderNo });
  }
  return orderNo.toString();
}

type orderMessageType = {
  orderNo: number;
  totalAmount: number;
  date: string;
  items: {
    name: string;
    quantity: number;
    price: number;
    weight: number;
  }[];
};

export function generateOrderMessage(order: orderMessageType) {
  let itemsList = "";
  order.items.forEach((item) => {
    itemsList += `<li>${item.quantity}x ${item.name}: N${(item.price * item.quantity).toFixed(2)}</li>`;
  });
  const message = `
      <h1>Order Confirmation</h1>
      <p>Thank you for placing an order with us. Your order has been placed successfully.</p>
      <p>Order No: ${order.orderNo}</p>
      <h2>Order Items:</h2>
      <ul>
        ${itemsList}
      </ul>
      <p>Total Amount: N${order.totalAmount}</p>
      <p>Order Date: ${order.date}</p>
      `;
  return message;
}

/**Utlity function that returns the current state of the user's cart */
export async function cartInfo(user: IUser) {
  user = await user.populate({
    path: "cart.dish",
    select: "-__v -createdAt -updatedAt",
  });
  const cartItems = user.cart;
  const outputData = {
    items: cartItems,
    subTotal: cartItems.reduce(
      (acc, item) => acc + item.dish.price * item.quantity,
      0,
    ),
    itemsTotal: cartItems.reduce((acc, item) => acc + item.quantity, 0),
    weightTotal: cartItems.reduce(
      (acc, item) => acc + item.quantity * item.dish.size,
      0,
    ),
  };
  return outputData;
}
