const express = require("express");
const { existsSync, readJson, writeJson } = require("fs-extra");
const path = require("path");
const User = require("./dtos/user");
const Medication = require("./dtos/medication");
const cors = require("cors");

const randomMedications = [
  "https://i.ibb.co/Y4kz9VSP/comprime.png",
  "https://i.ibb.co/hR1LdCR5/comprime2.png",
  "https://i.ibb.co/wZCLJVX7/comprime3.jpg",
  "https://i.ibb.co/GvxMVDHX/comprime4-removebg-preview.png",
  "https://i.ibb.co/TxqzbB7R/Drug-Item-26975-removebg-preview.png",
  "https://i.ibb.co/v4PYw3CK/single-softgel-capsule-pill-isolated-blue-dietary-drug-over-white-background-85532805-1-removebg-pre.png",
  "https://i.ibb.co/TBnMsVVy/R-removebg-preview.png",
];

// const randomMedications = [
//   "https://thumbs.dreamstime.com/b/one-single-pill-isolated-white-table-89122099.jpg",
//   "https://c1.staticflickr.com/9/8510/8488782713_47d8551e38_b.jpg",
//   "https://cdn.shopify.com/s/files/1/0084/9579/2205/products/80183-795-429_1024x.jpg",
//   "https://canadianpharmacyonline247.com/lib/products/457.jpg",
//   "https://buzzrx.s3.amazonaws.com/gs/DrugItem_26975.JPG",
// ];

const app = express();
app.use(cors());

const PORT = 3000;

const USER_DATA_PATH = path.join(__dirname, "data/users.json");
const MED_DATA_PATH = path.join(__dirname, "data/prescriptions.json");

const whiteListedIps = []; //add here once we use

app.use(express.json());
app.use((req, res, next) => {
  //const clientIp = req.ip || req.connection.remoteAddress;

  //   if (!whiteListedIps.includes(clientIp)) {
  //     return res.status(403).json({ error: "Access denied" });
  //   }

  next();
});

//GET ALL USERS
app.get("/data/users/all", async (req, res) => {
  if (!existsSync(USER_DATA_PATH)) {
    return res.status(404).json({ error: "User data file not found" });
  }

  try {
    const users = await readJson(USER_DATA_PATH);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to read user file" });
  }
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
    medications[index].hasTaken = true;
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
    const newUser = User.fromObject(req.body);
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

    const randomIndex = Math.floor(Math.random() * randomMedications.length);
    const randomElement = randomMedications[randomIndex];
    newMedication.img_url = randomElement;

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
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});
