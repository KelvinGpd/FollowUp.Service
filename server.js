const express = require("express");
const { existsSync, readJson, writeJson } = require("fs-extra");
const path = require("path");
const User = require("./dtos/User");
const Medication = require("./dtos/Medication");

const app = express();
const PORT = 3000;

const USER_DATA_PATH = path.join(__dirname, "data/users.json");
const MED_DATA_PATH = path.join(__dirname, "data/prescriptions.json");

const whiteListedIps = []; //add here once we use

app.use(express.json());
app.use((req, res, next) => {
  const clientIp = req.ip || req.connection.remoteAddress;

  if (!whiteListedIps.includes(clientIp)) {
    return res.status(403).json({ error: "Access denied" });
  }

  next();
});

//GET USER BY NAME
app.get("/data/users", async (req, res) => {
  const { name } = req.query;

  if (!name) {
    return res.status(400).json({ error: "Missing 'name' query parameter" });
  }
  if (!existsSync(USER_DATA_PATH)) {
    return res.status(404).json({ error: "User data file not found" });
  }

  try {
    const users = await readJson(USER_DATA_PATH);
    const user = users.find((user) => user.name === name);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to read user file" });
  }
});

//GET MEDICATIONS FOR A USER
app.get("/data/prescriptions", async (req, res) => {
  const { name } = req.query; // Get name from query params

  if (!name) {
    return res.status(400).json({ error: "Missing 'name' query parameter" });
  }
  if (!existsSync(MED_DATA_PATH)) {
    return res.status(404).json({ error: "Medication data file not found" });
  }

  try {
    const medications = await readJson(MED_DATA_PATH);
    const userMedications = medications.filter(
      (med) => med.patientName === name
    );
    res.json(userMedications);
  } catch (err) {
    res.status(500).json({ error: "Failed to read medication file" });
  }
});

//UPDATE MEDICATION LAST TAKEN
app.put("/data/prescriptions", async (req, res) => {
  const { uuid, newDate } = req.body;

  if (!uuid || !newDate) {
    return res
      .status(400)
      .json({ error: "Missing 'uuid' or 'newDate' in request body" });
  }
  if (!existsSync(MED_DATA_PATH)) {
    return res.status(404).json({ error: "Medication data file not found" });
  }

  try {
    const medications = await readJson(MED_DATA_PATH);
    const index = medications.findIndex((med) => med.uuid === uuid);

    if (index === -1) {
      return res.status(404).json({ error: "Medication not found" });
    }

    medications[index].lastTakenDate = newDate;
    await writeJson(MED_DATA_PATH, medications, { spaces: 2 });

    res.json({
      success: true,
      message: "Medication updated successfully",
      updatedMedication: medications[index],
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to update medication file" });
  }
});

// CREATE A NEW USER
app.post("/data/users", async (req, res) => {
  try {
    const newUser = User.fromObject(req.body); // Validate & create user object
    const users = existsSync(USER_DATA_PATH)
      ? await readJson(USER_DATA_PATH)
      : [];

    if (users.find((user) => user.name === newUser.name)) {
      return res.status(400).json({ error: "User already exists" });
    }

    users.push(newUser);
    await writeJson(USER_DATA_PATH, users, { spaces: 2 });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: newUser,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// CREATE A NEW MEDICATION (Using Medication Class)
app.post("/data/prescriptions", async (req, res) => {
  try {
    const newMedication = Medication.fromObject(req.body); // Validate & create medication object
    const medications = existsSync(MED_DATA_PATH)
      ? await readJson(MED_DATA_PATH)
      : [];

    medications.push(newMedication);
    await writeJson(MED_DATA_PATH, medications, { spaces: 2 });

    res.status(201).json({
      success: true,
      message: "Medication added successfully",
      medication: newMedication,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
