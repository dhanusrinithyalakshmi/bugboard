require("dotenv").config();
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const bugSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
  status: { type: String, enum: ["todo", "progress", "fixed"], default: "todo" },
  date: { type: String, default: () => new Date().toLocaleDateString() }
});

// Send "id" to the frontend instead of MongoDB's "_id"
bugSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  }
});

const Bug = mongoose.model("Bug", bugSchema);

// Get all bugs
app.get("/api/bugs", async (req, res) => {
  try {
    const bugs = await Bug.find().sort({ _id: 1 });
    res.json(bugs);
  } catch (err) {
    res.status(500).json({ error: "Could not load bugs" });
  }
});

// Add a bug
app.post("/api/bugs", async (req, res) => {
  try {
    const { title, description, priority } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Title is required" });
    }
    const bug = await Bug.create({ title, description, priority });
    res.status(201).json(bug);
  } catch (err) {
    res.status(400).json({ error: "Could not add bug" });
  }
});

// Update a bug (edit or move)
app.put("/api/bugs/:id", async (req, res) => {
  try {
    const { title, description, priority, status } = req.body;
    const changes = {};
    if (title !== undefined) changes.title = title;
    if (description !== undefined) changes.description = description;
    if (priority !== undefined) changes.priority = priority;
    if (status !== undefined) changes.status = status;

    const bug = await Bug.findByIdAndUpdate(req.params.id, changes, {
      new: true,
      runValidators: true
    });
    if (!bug) {
      return res.status(404).json({ error: "Bug not found" });
    }
    res.json(bug);
  } catch (err) {
    res.status(400).json({ error: "Could not update bug" });
  }
});

// Delete a bug
app.delete("/api/bugs/:id", async (req, res) => {
  try {
    await Bug.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (err) {
    res.status(400).json({ error: "Could not delete bug" });
  }
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`BugBoard running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
  });