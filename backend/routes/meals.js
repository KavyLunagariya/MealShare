const express = require("express");
const mongoose = require("mongoose");
const Meal = require("../models/Meal");
const { protect, allowRoles } = require("../middleware/auth");

const router = express.Router();

// GET all available meals for receivers and the public meals page
router.get("/", async (req, res) => {
  try {
    const meals = await Meal.find({
      available: true,
      quantity: { $gt: 0 },
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: meals.length,
      meals,
    });
  } catch (error) {
    console.error("Get meals error:", error);

    return res.status(500).json({
      success: false,
      message: "Could not load meals.",
    });
  }
});

// GET meals belonging to the logged-in donor
router.get(
  "/restaurant/:restaurantId",
  protect,
  allowRoles("food-lister"),
  async (req, res) => {
    try {
      const { restaurantId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid restaurant ID.",
        });
      }

      // A donor can only view their own meals
      if (restaurantId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "You can only view your own meals.",
        });
      }

      const meals = await Meal.find({
        restaurantId: req.user.id,
      }).sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        count: meals.length,
        meals,
      });
    } catch (error) {
      console.error("Get restaurant meals error:", error);

      return res.status(500).json({
        success: false,
        message: "Could not load restaurant meals.",
      });
    }
  }
);

// CREATE a meal — food listers only
router.post(
  "/",
  protect,
  allowRoles("food-lister"),
  async (req, res) => {
    try {
      const {
        title,
        description,
        category,
        image,
        price,
        oldPrice,
        quantity,
        business,
        address,
        phone,
        pickupTime,
      } = req.body;

      if (
        !title?.trim() ||
        !business?.trim() ||
        price === undefined ||
        quantity === undefined
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Title, restaurant name, price, and quantity are required.",
        });
      }

      const numericPrice = Number(price);
      const numericOldPrice = Number(oldPrice ?? 0);
      const numericQuantity = Number(quantity);

      if (
        !Number.isFinite(numericPrice) ||
        numericPrice < 0 ||
        !Number.isFinite(numericOldPrice) ||
        numericOldPrice < 0 ||
        !Number.isInteger(numericQuantity) ||
        numericQuantity < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Enter valid price and whole-number quantity values.",
        });
      }

      // Never trust a restaurant ID supplied by the browser
      const meal = await Meal.create({
        title: title.trim(),
        description,
        category,
        image,
        price: numericPrice,
        oldPrice: numericOldPrice,
        quantity: numericQuantity,
        available: numericQuantity > 0,
        business: business.trim(),
        restaurantId: req.user.id,
        address,
        phone,
        pickupTime,
      });

      return res.status(201).json({
        success: true,
        message: "Meal created successfully.",
        meal,
      });
    } catch (error) {
      console.error("Create meal error:", error);

      return res.status(500).json({
        success: false,
        message: "Could not create meal.",
      });
    }
  }
);

// UPDATE a meal — its owner only
router.put(
  "/:id",
  protect,
  allowRoles("food-lister"),
  async (req, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid meal ID.",
        });
      }

      const meal = await Meal.findOne({
        _id: req.params.id,
        restaurantId: req.user.id,
      });

      if (!meal) {
        return res.status(404).json({
          success: false,
          message: "Meal not found in your listings.",
        });
      }

      const {
        title,
        description,
        category,
        image,
        price,
        oldPrice,
        quantity,
        business,
        address,
        phone,
        pickupTime,
      } = req.body;

      if (title !== undefined) meal.title = title.trim();
      if (description !== undefined) meal.description = description ? description.trim() : "";
      if (category !== undefined) meal.category = category;
      if (image !== undefined) meal.image = image;
      if (price !== undefined) meal.price = Number(price);
      if (oldPrice !== undefined) meal.oldPrice = Number(oldPrice ?? 0);
      if (quantity !== undefined) {
        meal.quantity = Number(quantity);
        meal.available = meal.quantity > 0;
      }
      if (business !== undefined) meal.business = business.trim();
      if (address !== undefined) meal.address = address ? address.trim() : "";
      if (phone !== undefined) meal.phone = phone || "";
      if (pickupTime !== undefined) meal.pickupTime = pickupTime || "";

      await meal.save();

      return res.status(200).json({
        success: true,
        message: "Meal updated successfully.",
        meal,
      });
    } catch (error) {
      console.error("Update meal error:", error);

      return res.status(500).json({
        success: false,
        message: "Could not update meal.",
      });
    }
  }
);

// DELETE a meal — its owner only
router.delete(
  "/:id",
  protect,
  allowRoles("food-lister"),
  async (req, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid meal ID.",
        });
      }

      const meal = await Meal.findOne({
        _id: req.params.id,
        restaurantId: req.user.id,
      });

      if (!meal) {
        return res.status(404).json({
          success: false,
          message: "Meal not found in your listings.",
        });
      }

      await meal.deleteOne();

      return res.status(200).json({
        success: true,
        message: "Meal deleted successfully.",
      });
    } catch (error) {
      console.error("Delete meal error:", error);

      return res.status(500).json({
        success: false,
        message: "Could not delete meal.",
      });
    }
  }
);

module.exports = router;
