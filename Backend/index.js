import express from "express";
import dotenv from "dotenv";
dotenv.config();
import helmet from "helmet";
import compression from "compression";
import cors from "cors";
import morgan from "morgan";
import createError from "http-errors";

import connectDB from "./db.js";
import tasksRouter from "./routes/tasks.js";
import errorHandler from "./middleware/errorHandler.js";


const app = express();

// Middleware
app.use(express.json());
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(morgan("dev"));

// Routes
app.use("/api/tasks", tasksRouter);

// 404 handler
app.use((req, res, next) => {
  next(createError(404, "Not Found"));
});

// Error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () =>
    console.log(`🚀 Server running at http://localhost:${PORT}`)
  );
});
