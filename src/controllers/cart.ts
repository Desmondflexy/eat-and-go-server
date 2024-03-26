import { Request, Response } from "express";
import Dish, { IDish } from "../models/dish";
import User, { IUser } from "../models/users";

// Adding a dish to Cart and calculating the amount
export async function addToCart(req: Request, res: Response) {
  try {
    const userId = req.user.id;
    const dishId = req.body.dishId;
    const dish = await Dish.findById(dishId);

    if (!dish) {
      return res.status(404).json({
        message: "Not found",
        error: "Dish not found",
      });
    }

    // Add the dish to the cart
    const user = (await User.findById(userId)) as IUser;
    // check if item already in cart and update quantity and totalAmount
    const itemIndex = user.cart.findIndex(
      (item) => item.dishId.toString() === dishId,
    );
    let message = `Dish '${dish.name}' added to cart successfully`;
    if (itemIndex !== -1) {
      const foundItem = user.cart[itemIndex];
      foundItem.quantity += 1;
      foundItem.totalAmount += dish.price;
      foundItem.weight += dish.size;
      message = `Dish '${dish.name}' quantity updated in cart successfully`;
    } else {
      user.cart.push({
        dishId,
        quantity: 1,
        totalAmount: dish.price,
        weight: dish.size,
      });
    }
    await user.save();

    res.json({
      message,
      cart: user.cart,
      subTotal: user.cart.reduce((acc, item) => acc + item.totalAmount, 0),
      itemsTotal: user.cart.reduce((acc, item) => acc + item.quantity, 0),
      weightTotal: user.cart.reduce((acc, item) => acc + item.weight, 0),
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}

export async function removeFromCart(req: Request, res: Response) {
  try {
    const userId = req.user.id;
    const dishId = req.body.dishId;
    const user = (await User.findById(userId)) as IUser;

    // check if item already in cart and update quantity and totalAmount
    const itemIndex = user.cart.findIndex(
      (item) => item.dishId.toString() === dishId,
    );
    if (itemIndex === -1) {
      return res.status(404).json({
        message: "Not found",
        error: "Dish not found in cart",
      });
    }
    user.cart.splice(itemIndex, 1);
    await user.save();
    return res.json({
      message: "Dish removed from cart successfully",
      cart: user.cart,
      subTotal: user.cart.reduce((acc, item) => acc + item.totalAmount, 0),
      itemsTotal: user.cart.reduce((acc, item) => acc + item.quantity, 0),
      weightTotal: user.cart.reduce((acc, item) => acc + item.weight, 0),
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}

export async function decreaseQuantity(req: Request, res: Response) {
  try {
    const userId = req.user.id;
    const dishId = req.body.dishId;
    const user = (await User.findById(userId)) as IUser;

    // check if item already in cart and update quantity and totalAmount
    const itemIndex = user.cart.findIndex(
      (item) => item.dishId.toString() === dishId,
    );
    if (itemIndex === -1) {
      return res.status(404).json({
        message: "Not found",
        error: "Dish not found in cart",
      });
    }
    const foundItem = user.cart[itemIndex];
    if (foundItem.quantity === 1) {
      user.cart.splice(itemIndex, 1);
    } else {
      const dish = (await Dish.findById(dishId)) as IDish;
      foundItem.quantity -= 1;
      foundItem.totalAmount -= dish.price;
      foundItem.weight -= dish.size;
    }
    await user.save();
    return res.json({
      message: "Dish quantity decreased in cart successfully",
      cart: user.cart,
      subTotal: user.cart.reduce((acc, item) => acc + item.totalAmount, 0),
      itemsTotal: user.cart.reduce((acc, item) => acc + item.quantity, 0),
      weightTotal: user.cart.reduce((acc, item) => acc + item.weight, 0),
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}

export async function clearCart(req: Request, res: Response) {
  try {
    const userId = req.user.id;
    const user = (await User.findById(userId)) as IUser;
    user.cart = [];
    await user.save();
    return res.json({
      message: "Cart cleared successfully",
      cart: user.cart,
      subTotal: 0,
      itemsTotal: 0,
      weightTotal: 0,
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}

export async function getCart(req: Request, res: Response) {
  try {
    const userId = req.user.id;
    const user = (await User.findById(userId).populate(
      "cart.dishId",
      "-__v",
    )) as IUser;
    return res.json({
      message: "Cart items",
      cart: user.cart,
      subTotal: user.cart.reduce((acc, item) => acc + item.totalAmount, 0),
      itemsTotal: user.cart.reduce((acc, item) => acc + item.quantity, 0),
      weightTotal: user.cart.reduce((acc, item) => acc + item.weight, 0),
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}
