require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const appointmentRoute = require("./routes/appointment");

const app = express();

app.use(helmet());
app.use(cors({ origin: true }));
app.use(express.json({ limit: "200kb" }));

app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.get("/api/health", (_, res) => res.json({ ok: true }));

app.use("/api/appointment", appointmentRoute);

// Ensure all unknown API routes return JSON (not HTML), preventing client JSON parse errors
app.use((req, res, next) => {
  if (req.originalUrl.startsWith("/api/")) {
    return res.status(404).json({ ok: false, message: "API route not found." });
  }
  next();
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ ok: false, message: "Server error." });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
