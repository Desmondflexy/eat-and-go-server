import { Request, Response } from "express";
import Dish from "../models/dish";
import { deleteFromCloud, upload2cloud } from "../utils/helper-functions";
import * as v from "../utils/validators";

export async function addDish(req: Request, res: Response) {
  try {
    const { error } = v.addDish.validate(req.body, v.options);
    if (error) {
      console.error(error);
      return res.status(400).json({
        message: "Input validation failed",
        error: error.details.map((err) => err.message),
      });
    }
    // picture size should not exceed 1mb
    if (req.file?.size && req.file.size > 1 * 1000 * 1000) {
      return res.status(400).json({
        message: "Bad request",
        error: "Picture size should not exceed 1 MB",
      });
    }
    // create a new dish
    const dish = await Dish.create({
      name: req.body.name,
      category: req.body.category,
      size: req.body.size,
      price: req.body.price,
      notes: req.body.notes,
      picture: await upload2cloud(req.file?.path),
      availability: req.body.availability,
      vendorId: req.user.id,
    });
    res.json({
      message: `New dish '${dish.name}' added successfully`,
      dish,
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}

export async function getAllDishes(req: Request, res: Response) {
  try {
    const dishes = await Dish.find();
    return res.json({
      message: "All dishes",
      dishes,
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}

export async function getDish(req: Request, res: Response) {
  try {
    const dish = await Dish.findById(req.params.id);
    if (!dish) {
      return res.status(404).json({
        message: "Not found",
        error: "Dish not found",
      });
    }
    return res.json({ dish });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}

export async function deleteDish(req: Request, res: Response) {
  try {
    const dish = await Dish.findOne({
      _id: req.params.id,
      vendorId: req.user.id,
    });
    if (!dish) {
      return res.status(404).json({
        message: "Not found",
        error: "Dish not found",
      });
    }
    if (dish.picture) await deleteFromCloud(dish.picture);
    await dish.deleteOne();
    return res.json({
      message: `Dish '${dish.name}' deleted successfully`,
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}

export async function updateDish(req: Request, res: Response) {
  try {
    const result = v.updateDish.validate(req.body, v.options);
    if (result.error) {
      return res.status(400).json({
        message: "Input validation failed",
        error: result.error.details.map((err) => err.message),
      });
    }

    const dish = await Dish.findOne({
      _id: req.params.id,
      vendorId: req.user.id,
    });
    if (!dish) {
      return res.status(404).json({
        message: "Not found",
        error: "Dish not found",
      });
    }

    dish.name = req.body.name || dish.name;
    dish.category = req.body.category || dish.category;
    dish.size = req.body.size || dish.size;
    dish.price = req.body.price || dish.price;
    dish.notes = req.body.notes || dish.notes;
    dish.availability = req.body.availability || dish.availability;

    if (req.file) {
      if (req.file.size > 1 * 1000 * 1000) {
        return res.status(400).json({
          message: "Bad request",
          error: "Picture size should not exceed 1 MB",
        });
      }
      if (dish.picture) await deleteFromCloud(dish.picture);
      dish.picture = await upload2cloud(req.file.path);
    }
    await dish.save();
    return res.json({
      message: `Dish '${dish.name}' updated successfully!`,
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}

export async function getVendorDishes(req: Request, res: Response) {
  try {
    const dishes = await Dish.find({ vendorId: req.user.id });
    return res.json({
      message: "My dishes",
      dishes,
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}

export async function getDishByVendorId(req: Request, res: Response) {
  try {
    const dishes = await Dish.find({ vendorId: req.params.id });
    return res.json({
      message: "Vendor dishes",
      dishes,
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}
