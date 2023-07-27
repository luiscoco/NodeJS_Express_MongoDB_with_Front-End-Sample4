const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");
const path = require("path");

const app = express();
const port = 3000;

// Connect to MongoDB
let notes;

(async () => {
  const client = new MongoClient("mongodb://localhost:27017");
  try {
    await client.connect();
    const db = client.db("tutor");
    notes = db.collection("notes");
    console.log("MongoDB connected successfully.");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  }
})();

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

// Get all notes
app.get("/notes", async (req, res) => {
  try {
    let cursor = await notes.find({});
    let items = await cursor.toArray();
    res.json(items);
  } catch (err) {
    console.error("Error retrieving notes:", err);
    res.status(500).json({ error: "An error occurred while retrieving notes." });
  }
});

// Add a new note
app.post("/notes", async (req, res) => {
  try {
    await notes.insertOne(req.body);
    res.json({ message: "Note added successfully." });
  } catch (err) {
    console.error("Error adding note:", err);
    res.status(500).json({ error: "An error occurred while adding a note." });
  }
});

// Delete a note
app.delete("/notes/:id", async (req, res) => {
  let id = new ObjectId(req.params.id);
  try {
    const result = await notes.deleteOne({ _id: id });
    if (result.deletedCount === 1) {
      res.json({ ok: true });
    } else {
      res.json({ ok: false });
    }
  } catch (err) {
    console.error("Error deleting note:", err);
    res.status(500).json({ error: "An error occurred while deleting the note." });
  }
});

// Update a note
app.put("/notes/:id", async (req, res) => {
  try {
    let id = new ObjectId(req.params.id);
    const result = await notes.updateOne({ _id: id }, { $set: req.body });
    if (result.matchedCount === 1) {
      res.json({ message: "Note updated successfully." });
    } else {
      res.status(404).json({ error: "Note not found." });
    }
  } catch (err) {
    console.error("Error updating note:", err);
    res.status(500).json({ error: "An error occurred while updating the note." });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
