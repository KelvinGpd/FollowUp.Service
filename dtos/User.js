const { v4: uuidv4 } = require("uuid");

class User {
    constructor(name, branchName, branchAddress, ailments, phoneNumber) {
        this.uuid = uuidv4();
        this.name = name;
        this.branchName = branchName;
        this.branchAddress = branchAddress;
        this.ailments = ailments;
        this.phoneNumber = phoneNumber;
    }

    static validate(obj) {
        return (
            obj &&
            typeof obj.uuid === "string" &&
            typeof obj.name === "string" &&
            typeof obj.branchName === "string" &&
            typeof obj.branchAddress === "string" &&
            typeof obj.ailments === "string" &&
            typeof obj.phoneNumber === "string"
        );
    }

    static fromObject(obj) {
        if (!User.validate(obj)) {
            throw new Error("Invalid user object format.");
        }
        return new User(
            obj.name,
            obj.branchName,
            obj.branchAddress,
            obj.ailments,
            obj.phoneNumber
        );
    }
}