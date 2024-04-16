import Order from "../models/order";
import User, { IUser } from "../models/users";
import { Request, Response } from "express";
import { sendOrderDetailsEmail } from "../services/emailService";

export async function getAllOrders(req: Request, res: Response) {
  try {
    const orders = await Order.find();
    return res.json({
      message: "All orders",
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
    const orders = await Order.find({ userId: req.user.id });
    return res.json({
      message: "My orders",
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
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        message: "Not found",
        error: "Order not found",
      });
    }
    return res.json({ order });
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
    const user = (await User.findById(req.user.id)) as IUser;
    const cartItems = user.cart;

    if (cartItems.length === 0) {
      return res.status(400).json({
        message: "Bad request",
        error: "Cart is empty",
      });
    }

    const order = new Order({
      userId: req.user.id,
      items: cartItems.map((item) => ({
        dish: item.dishId,
        quantity: item.quantity,
        totalAmount: item.totalAmount,
        weight: item.weight,
      })),
    });

    // Clear the user's cart after making an order
    user.cart = [];
    await user.save();

    // Save the order
    await order.save();

    res.json({
      message: "Order placed successfully",
      order: order,
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}

export async function sendOrderDetails(req: Request, res: Response) {
  try {
    const orderId = req.body.orderId;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        message: "Not found",
        error: "Order not found",
      });
    }

    // Send order details to the customer
    await sendOrderDetailsEmail(order);
    res.json({ message: "Order details sent to customer successfully" });
  } catch (error: any) {
    console.error("Error sending order details:", error);
    res.status(500).json({ error: "Failed to send order details to customer" });
  }
}
