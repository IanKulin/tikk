const express = require("express");
const db = require("./db");

const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// Students Page - get all students
app.get("/students", async (req, res) => {
  try {
    const students = await db.fetchAllStudents();
    const username = "ian";
    res.render("students", { title: "Students", students, username });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching students from the database.");
  }
});

// active search to update students page
app.post("/h-student-search", async (req, res) => {
  try {
    const students = await db.fetchStudentsByFuzzyName(req.body.search);
    const username = req.username;
    res.render("./partials/studenttable", {
      title: "Students",
      students,
      username,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching students from the database.");
  }
});

db.createDatabase();

const server = app.listen(port, () => {
  console.log(`Tikk running on internal port ${port}`);
});

// Listen for the SIGINT signal (Ctrl+C)
process.on("SIGINT", () => {
  console.log("\nClosing on SIGINT...");
  db.closeDatabase();
  console.log("Database connection closed.");

  server.close((err) => {
    if (err) {
      console.error("Error while closing server:", err);
      process.exit(1);
    }
  });
  console.log("Server closed.");
  process.exit(0);
});
