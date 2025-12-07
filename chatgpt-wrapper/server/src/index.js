import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieSession from "cookie-session";
import passport from "./auth.js";
import chatRoutes from "./chatRoutes.js";

dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173", // React dev server
    credentials: true,
  })
);

app.use(express.json());

app.use(
  cookieSession({
    name: "session",
    keys: [process.env.SESSION_SECRET],
    maxAge: 24 * 60 * 60 * 1000,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Google auth routes
app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:5173/login-failed",
    session: true,
  }),
  (req, res) => {
    // On success, redirect back to frontend
    res.redirect("http://localhost:5173/");
  }
);

// Simple route so frontend can see logged-in user
app.get("/api/me", (req, res) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return res.json({
      authenticated: true,
      user: req.user,
    });
  }
  return res.json({ authenticated: false });
});

// Chat routes (GET / POST / HEAD)
app.use("/api/chat", chatRoutes);

// Start server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
