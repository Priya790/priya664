// Importing required modules
const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
require("dotenv").config();

// Create Express app
const app = express();

// Middleware setup
app.use(morgan("dev")); // Logger for HTTP requests
app.use(express.json()); // Parse incoming JSON requests

// Custom logging middleware
const loggingMiddleware = (req, res, next) => {
  const currentDate = new Date();
  console.log(
    `[${currentDate.toISOString()}] ${req.method} ${req.originalUrl}`
  );
  next();
};
app.use(loggingMiddleware);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Define a Mongoose schema and model for a sample resource
const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
});

const Item = mongoose.model("Item", itemSchema);

// Basic routing
app.get("/", (req, res) => {
  res.send("Welcome to the Node.jsui App!");
});

// Route to create a new item
app.post("/items", async (req, res) => {
  try {
    const newItem = new Item(req.body);
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Route to get all items
app.get("/items", async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route to get a single item by ID
app.get("/items/:id", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route to update an item by ID
app.put("/items/:id", async (req, res) => {
  try {
    const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedItem) return res.status(404).json({ error: "Item not found" });
    res.json(updatedItem);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Route to delete an item by ID
app.delete("/items/:id", async (req, res) => {
  try {
    const deletedItem = await Item.findByIdAndDelete(req.params.id);
    if (!deletedItem) return res.status(404).json({ error: "Item not found" });
    res.json({ message: "Item deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
