const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

let bugs = [];

// Get all bugs
app.get("/api/bugs", (req, res) => {
  res.json(bugs);
});

// Add a bug
app.post("/api/bugs", (req, res) => {
  const { title, description, priority } = req.body;
  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }
  const bug = {
    id: Date.now(),
    title,
    description: description || "",
    priority: priority || "Medium",
    status: "todo",
    date: new Date().toLocaleDateString()
  };
  bugs.push(bug);
  res.status(201).json(bug);
});

// Update a bug (edit or move)
app.put("/api/bugs/:id", (req, res) => {
  const bug = bugs.find((b) => b.id === Number(req.params.id));
  if (!bug) {
    return res.status(404).json({ error: "Bug not found" });
  }
  Object.assign(bug, req.body);
  res.json(bug);
});

// Delete a bug
app.delete("/api/bugs/:id", (req, res) => {
  bugs = bugs.filter((b) => b.id !== Number(req.params.id));
  res.status(204).end();
});

app.listen(PORT, () => {
  console.log(`BugBoard running at http://localhost:${PORT}`);
});