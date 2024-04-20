import { Request, Response } from "express";
import Dish from "../models/dish";
import User, { IUser } from "../models/users";
import { cartInfo } from "../utils/helper-functions";

// Adding a dish to Cart and calculating the amount
export async function addToCart(req: Request, res: Response) {
  try {
    const userId = req.user.id;
    const dishId = req.params.dishId;
    const dish = await Dish.findById(dishId).lean();

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
      (i) => i.dish._id.toString() === dishId,
    );

    if (itemIndex !== -1) {
      const foundItem = user.cart[itemIndex];
      foundItem.quantity += 1;
    } else {
      user.cart.push({
        dish,
        quantity: 1,
      });
    }
    await user.save();

    res.json(await cartInfo(user));
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}

/**Removes a dish from cart */
export async function removeFromCart(req: Request, res: Response) {
  try {
    const userId = req.user.id;
    const dishId = req.params.dishId;
    const user = (await User.findById(userId)) as IUser;

    // check if item already in cart and update quantity and totalAmount
    const itemIndex = user.cart.findIndex(
      (item) => item.dish._id.toString() === dishId,
    );
    if (itemIndex === -1) {
      return res.status(404).json({
        message: "Not found",
        error: "Dish not found in cart",
      });
    }
    user.cart.splice(itemIndex, 1);
    await user.save();
    return res.json(await cartInfo(user));
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}

/**Decrease the quantity of a dish in a cart */
export async function decreaseQuantity(req: Request, res: Response) {
  try {
    const userId = req.user.id;
    const dishId = req.params.dishId;
    const user = (await User.findById(userId)) as IUser;

    // find dish in cart and update quantity
    const itemIndex = user.cart.findIndex(
      (item) => item.dish._id.toString() === dishId,
    );
    if (itemIndex === -1) {
      return res.status(404).json("Dish not found in cart");
    }
    const foundItem = user.cart[itemIndex];
    if (foundItem.quantity === 1) {
      user.cart.splice(itemIndex, 1);
    } else foundItem.quantity -= 1;

    await user.save();
    return res.json(await cartInfo(user));
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
    return res.json([]);
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
    const user = (await User.findById(userId)) as IUser;

    return res.json(await cartInfo(user));
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}
