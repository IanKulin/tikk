const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database(
  "./db/data.sqlite3",
  sqlite3.OPEN_CREATE | sqlite3.OPEN_READWRITE,
  (err) => {
    if (err) {
      console.error(err.message);
    } else {
      console.log("Connected to the database.");
    }
  }
);

// Database access //////////////////////////////

async function closeDatabase() {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

async function fetchAllStudents() {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM students", (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

async function fetchStudentsByFuzzyName(search) {
  return new Promise((resolve, reject) => {
    db.all(
      "SELECT * FROM students WHERE first_name LIKE ? OR surname LIKE ?",
      [`%${search}%`, `%${search}%`],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      }
    );
  });
}

// Database and table creation //////////////////

const student_table_schema = `CREATE TABLE students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_number TEXT,
  first_name TEXT,
  surname TEXT,
  year TEXT,
  form TEXT,
  house TEXT,
  date_of_birth TEXT
)`;

const ticket_table_schema = `CREATE TABLE tickets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT,
  student_name TEXT,
  student_id TEXT,
  reporter TEXT,
  expectation TEXT,
  detail TEXT,
  location TEXT
)`;

const studentsData = [
  [
    "3183126",
    "Kylen",
    "Clemenza",
    "1",
    "Gumnut",
    "Richardson Green",
    "3/5/2002",
  ],
  [
    "3183024",
    "Latisha",
    "Aitken",
    "9",
    "Mrs Crabapple",
    "Yardup Blue",
    "26/4/2013",
  ],
  ["3182462", "Denys", "Gunstone", "9", "Room 4", "Jinkers Red", "24/3/2003"],
];

const ticketsData = [
  [
    "2023-02-19T06:59:00Z",
    "Kylen Clemenza",
    "1",
    "Mrs Crabapple",
    "Kind",
    "Picking up rubbish",
    "Oval",
  ],
];

async function addStudentsData(db, studentsData) {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(
      "INSERT INTO students (student_number, first_name, surname, year, form, house, date_of_birth) VALUES (?, ?, ?, ?, ?, ?, ?)"
    );
    studentsData.forEach((student) => {
      stmt.run(student, (err) => {
        if (err) {
          reject(err);
        }
      });
    });
    stmt.finalize();
    resolve();
  });
}

async function addTicketsData(db, ticketsData) {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(
      "INSERT INTO tickets (date, student_name, student_id, reporter, expectation, detail, location) VALUES (?, ?, ?, ?, ?, ?, ?)"
    );
    ticketsData.forEach((ticket) => {
      stmt.run(ticket, (err) => {
        if (err) {
          reject(err);
        }
      });
    });
    stmt.finalize();
    resolve();
  });
}

async function checkTableExists(db, tableName) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT name FROM sqlite_master WHERE type='table' AND name=?`,
      [tableName],
      (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row ? true : false);
        }
      }
    );
  });
}

async function createTable(db, tableName, tableSchema) {
  return new Promise((resolve, reject) => {
    db.run(tableSchema, (err) => {
      if (err) {
        reject(err);
      } else {
        console.log(`${tableName} table created successfully.`);
        resolve();
      }
    });
  });
}

async function createDatabase() {
  try {
    const studentsTableExists = await checkTableExists(db, "students");
    if (!studentsTableExists) {
      console.log("Creating students table");
      await createTable(db, "students", student_table_schema);
      await addStudentsData(db, studentsData);
    }
    const ticketsTableExists = await checkTableExists(db, "tickets");
    if (!ticketsTableExists) {
      console.log("Creating tickets table");
      await createTable(db, "tickets", ticket_table_schema);
      await addTicketsData(db, ticketsData);
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

module.exports = {
  fetchAllStudents: fetchAllStudents,
  fetchStudentsByFuzzyName: fetchStudentsByFuzzyName,
  createDatabase: createDatabase,
  closeDatabase: closeDatabase,
};
