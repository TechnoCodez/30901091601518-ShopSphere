const express = require("express");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const Log = require("./models/Log");

const app = express();

app.set("trust proxy", 1);

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
  }),
);

app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: "Too many requests, please try again later." },
});
app.use("/api", limiter);

app.use(express.json());
app.use(require("./middleware/loggerMiddleware"));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/stats", require("./routes/statsRoutes"));

app.use((err, req, res, next) => {
  const timestamp = new Date().toISOString();
  console.error(
    `[${timestamp}] [ERROR] ${req.method} ${req.originalUrl} -`,
    err.message,
  );

  Log.create({
    timestamp: new Date(),
    level: "error",
    method: req.method,
    path: req.originalUrl,
    statusCode: err.statusCode || 500,
    userId: req.user ? req.user.id : null,
    message: err.message,
  }).catch((logErr) =>
    console.error("Failed to write error log:", logErr.message),
  );

  res.status(err.statusCode || 500).json({
    message: err.message || "Internal server error",
  });
});

module.exports = app;
