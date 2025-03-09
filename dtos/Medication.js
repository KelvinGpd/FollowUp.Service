const { v4: uuidv4 } = require("uuid");

class Medication {
    constructor(patientName, medicationName, consumptionDetails, prescriptionDate, expDate, interval, amount, dosage) {
        this.uuid = uuidv4();
        this.patientName = patientName;
        this.medicationName = medicationName;
        this.consumptionDetails = consumptionDetails;
        this.prescriptionDate = prescriptionDate;
        this.expDate = expDate;
        this.interval = interval;
        this.amount = amount;
        this.dosage = dosage;
        this.hasTaken = false;
    }

    static validate(obj) {
        if (
            obj &&
            typeof obj.patientName === "string" &&
            typeof obj.medicationName === "string" &&
            typeof obj.consumptionDetails === "string" &&
            typeof obj.prescriptionDate === "string" &&
            typeof obj.expDate === "string" &&
            typeof obj.amount === "string" &&
            typeof obj.dosage === "string" &&
            typeof obj.interval === "string"
        ) {
            return true;
        }
        return false;
    }

    static fromObject(obj) {
        if (!Medication.validate(obj)) {
            throw new Error("Invalid medication object format.");
        }
        return new Medication(
            obj.patientName,
            obj.medicationName,
            obj.consumptionDetails,
            obj.prescriptionDate,
            obj.expDate,
            obj.interval,
            obj.amount,
            obj.dosage,
        );
    }
}

module.exports = Medication;