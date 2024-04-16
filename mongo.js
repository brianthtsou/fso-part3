const mongoose = require("mongoose");

if (process.argv.length !== 5 && process.argv.length !== 3) {
  console.log("argument error!");
  process.exit(1);
}

const password = process.argv[2];
const name = process.argv[3];
const number = process.argv[4];

const url = `mongodb+srv://brian:${password}@cluster0.1m0ot6v.mongodb.net/phonebook?retryWrites=true&w=majority&appName=Cluster0`;

mongoose.set("strictQuery", false);

mongoose.connect(url);

const phoneNumberSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const PhoneNumber = mongoose.model("PhoneNumber", phoneNumberSchema);

const newPhoneNumber = new PhoneNumber({
  name: name,
  number: number,
});

if (name === undefined) {
  PhoneNumber.find({}).then((result) => {
    result.forEach((phonenumber) => {
      console.log(`${phonenumber.name} ${phonenumber.number}`);
    });
    mongoose.connection.close();
  });
} else {
  newPhoneNumber.save().then((result) => {
    console.log(`added ${name} number ${number} to phonebook`);
    mongoose.connection.close();
  });
}
