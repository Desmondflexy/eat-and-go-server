import Order from "../models/order";
import User, { IUser } from "../models/users";
import { Request, Response } from "express";
import sendMail from "../config/nodemailer";
import {
  generateOrderMessage,
  generateOrderNo,
} from "../utils/helper-functions";

const excludedFields = [
  "__v",
  "createdAt",
  "updatedAt",
  "password",
  "user",
  "isEmailVerified",
  "cart",
  "role",
  "_id",
  "availability",
  "description",
  "image",
  "vendorId",
  "vendor",
  "createdAt",
  "updatedAt",
  "ssoId",
  "ssoProvider",
].map((field) => `-${field}`);

export async function getAllOrders(req: Request, res: Response) {
  try {
    const orders = await Order.find()
      .select("-__v -updatedAt")
      .populate({
        path: "userId items.dish",
        select: excludedFields.join(" "),
      });
    return res.json({
      message: "All customers orders",
      numberOfOrders: orders.length,
      orders,
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}

export async function getMyOrders(req: Request, res: Response) {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .select("-__v -updatedAt -userId")
      .populate({
        path: "items.dish",
        select: excludedFields.join(" "),
      });
    return res.json({
      message: "My orders history",
      orders,
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}

export async function getOrder(req: Request, res: Response) {
  try {
    const order = await Order.findById(req.params.id)
      .select("-__v -updatedAt")
      .populate({
        path: "userId items.dish",
        select: excludedFields.join(" "),
      });
    if (!order) {
      return res.status(404).json({
        message: "Not found",
        error: "Order not found",
      });
    }
    return res.json(order);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}

//Making an order request from Cart
export async function createOrder(req: Request, res: Response) {
  try {
    const user = (await User.findById(req.user.id).populate({
      path: "cart.dish",
      select: "-__v -createdAt -updatedAt",
    })) as IUser;

    const cartItems = user.cart;

    if (cartItems.length === 0) {
      return res.status(400).json({
        message: "Bad request",
        error: "Please add items to cart before placing an order",
      });
    }

    const totalAmount = cartItems.reduce(
      (acc, item) => acc + item.dish.price * item.quantity,
      0,
    );

    let order = new Order({
      userId: req.user.id,
      orderNo: await generateOrderNo(),
      items: cartItems,
      totalAmount,
    });

    await order.save();

    order = await order.populate({
      path: "items.dish",
      select: "-__v -createdAt -updatedAt -availability",
    });

    user.cart = [];
    await user.save();

    // Send order details to the customer
    const message = generateOrderMessage({
      orderNo: order.orderNo,
      totalAmount: order.totalAmount,
      date: order.createdAt,
      items: order.items.map((item) => {
        return {
          name: item.dish.name,
          quantity: item.quantity,
          price: item.dish.price,
          weight: item.dish.size,
        };
      }),
    });
    sendMail(user.email, "Order Confirmation", message);
    res.status(201).json(order);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}
