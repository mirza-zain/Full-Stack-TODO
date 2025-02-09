import express from "express";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import authRoutes from "../src/routes/authRoutes.js";
import todoRoutes from "../src/routes/todoRoutes.js";
import authMiddleware from "../src/middleware/authMiddleware.js";

const app = express();

// Middleware
app.use(express.json());

// Get the file path from the URL of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Serve static files (like CSS & JS) properly
app.use(express.static(path.join(__dirname, '../public')));

// Serve HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "../public", "index.html"));
});

// Routes
app.use('/auth', authRoutes);
app.use('/todos', authMiddleware, todoRoutes);

// Export the Express app for Vercel
export default (req, res) => app(req, res);
