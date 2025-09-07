import express from "express";
import Task from "../models/Task.js";
import { body, param, query } from "express-validator";
import { validate } from "../middleware/validate.js";

const router = express.Router();

/**
 * @route GET /api/tasks
 * @desc Get all tasks (optional filter by title)
 */
router.get(
  "/",
  [query("title").optional().isString().withMessage("Title must be a string")],
  validate,
  async (req, res, next) => {
    try {
      const { title } = req.query;
      const filter = title ? { title: { $regex: title, $options: "i" } } : {};
      const tasks = await Task.find(filter);
      res.json({ tasks });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @route GET /api/tasks/:id
 * @desc Get task by ID
 */
router.get(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid task ID")],
  validate,
  async (req, res, next) => {
    try {
      const task = await Task.findById(req.params.id);
      if (!task) return res.status(404).json({ message: "Task not found" });
      res.json({ task });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @route POST /api/tasks
 * @desc Create new task
 */
router.post(
  "/",
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("description").optional().isString(),
    body("status")
      .optional()
      .isIn(["To Do", "In Progress", "Completed"])
      .withMessage("Invalid status"),
    body("dueDate").optional().isISO8601().toDate(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const task = new Task(req.body);
      await task.save();
      res.status(201).json({ message: "Task created successfully", task });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @route PUT /api/tasks/:id
 * @desc Update existing task
 */
router.put(
  "/:id",
  [
    param("id").isMongoId().withMessage("Invalid task ID"),
    body("title").optional().isString(),
    body("description").optional().isString(),
    body("status")
      .optional()
      .isIn(["To Do", "In Progress", "Completed"])
      .withMessage("Invalid status"),
    body("dueDate").optional().isISO8601().toDate(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!task) return res.status(404).json({ message: "Task not found" });
      res.json({ message: "Task updated successfully", task });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @route DELETE /api/tasks/:id
 * @desc Delete task by ID
 */
router.delete(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid task ID")],
  validate,
  async (req, res, next) => {
    try {
      const task = await Task.findByIdAndDelete(req.params.id);
      if (!task) return res.status(404).json({ message: "Task not found" });
      res.json({ message: "Task deleted successfully" });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
