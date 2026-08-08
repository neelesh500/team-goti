const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/topics", (req, res) => {
  const filePath = path.join(__dirname, "data", "topics.json");

  const topics = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  res.json(topics);
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});