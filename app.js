const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");
const path = require("path");
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express");

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
/**
 * @openapi
 * /notes:
 *   get:
 *     summary: Get all notes
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Note'
 */
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
/**
 * @openapi
 * /notes:
 *   post:
 *     summary: Add a new note
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Note'
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessMessage'
 */
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
/**
 * @openapi
 * /notes/{id}:
 *   delete:
 *     summary: Delete a note by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: ObjectId
 *         required: true
 *         description: ID of the note to delete
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessMessage'
 *       404:
 *         description: Note not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorMessage'
 */
app.delete("/notes/:id", async (req, res) => {
  let id = new ObjectId(req.params.id);
  try {
    const result = await notes.deleteOne({ _id: id });
    if (result.deletedCount === 1) {
      res.json({ ok: true });
    } else {
      res.status(404).json({ error: "Note not found." });
    }
  } catch (err) {
    console.error("Error deleting note:", err);
    res.status(500).json({ error: "An error occurred while deleting the note." });
  }
});

// Update a note
/**
 * @openapi
 * /notes/{id}:
 *   put:
 *     summary: Update a note by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: ObjectId
 *         required: true
 *         description: ID of the note to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Note'
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessMessage'
 *       404:
 *         description: Note not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorMessage'
 */
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

// Swagger components definitions
/**
 * @openapi
 * components:
 *   schemas:
 *     Note:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         content:
 *           type: string
 *       required:
 *         - title
 *         - content
 *     SuccessMessage:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *     ErrorMessage:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 */

// Swagger setup
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Notes App API",
      version: "1.0.0",
      description: "API documentation for the Notes App",
    },
    servers: [
      {
        url: `http://localhost:${port}`,
      },
    ],
  },
  apis: [__filename], // Use __filename to refer to the current file
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
