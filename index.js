require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();
const PhoneNumber = require("./models/phonenumber");

app.use(express.json());
app.use(cors());
app.use(express.static("dist"));

morgan.token("data", (req, res) => {
  return JSON.stringify(req.body);
});

const morganOptions = (req, res, next) => {
  if (req.method === "POST") {
    morgan(
      ":method :url :status :res[content-length] - :response-time ms :data"
    )(req, res, next);
  } else {
    morgan("tiny")(req, res, next);
  }
};

app.use(morganOptions);

// const requestLogger = (request, response, next) => {
//   console.log("Method:", request.method);
//   console.log("Path:  ", request.path);
//   console.log("Body:  ", request.body);
//   console.log("---");
//   next();
// };
// app.use(requestLogger);

app.get("/api/persons", (request, response) => {
  PhoneNumber.find({}).then((phonenumbers) => {
    response.json(phonenumbers);
  });
});

app.get("/api/persons/info", async (request, response) => {
  const numPeople = await PhoneNumber.countDocuments();
  const currentDate = new Date();
  const utcString = currentDate.toISOString();
  response.send(
    `Phonebook has info for ${numPeople} people <br/><br/>${utcString}`
  );
});

app.get("/api/persons/:id", (request, response) => {
  PhoneNumber.findById(request.params.id)
    .then((phonenumber) => {
      if (!phonenumber) {
        return response
          .status(404)
          .send({ message: "Phone number not found." });
      }
      response.json(phonenumber);
    })
    .catch((error) => {
      console.error("Error retrieving the phone number", error);
      response.status(500).send({ message: "Error retrieving phone number" });
    });
});

app.delete("/api/persons/:id", (req, res, next) => {
  PhoneNumber.findByIdAndDelete(req.params.id)
    .then((result) => {
      res.status(204).end();
    })
    .catch((error) => {
      next(error);
    });
});

const generateId = () => {
  const maxId =
    persons.length > 0 ? Math.max(...persons.map((person) => person.id)) : 0;
  return maxId + 1;
};

app.post("/api/persons", (req, res) => {
  const body = req.body;
  if (!body.name || !body.number) {
    return res.status(400).json({
      error: "content missing",
    });
  }

  const person = new PhoneNumber({
    name: body.name,
    number: body.number,
  });

  const match = PhoneNumber.find({ name: { $eq: body.name } })
    .then((found) => {
      // found is an array
      if (found !== undefined && found.length > 0) {
        return res.status(409).json({
          error: "name must be unique",
        });
      } else {
        person.save().then((savedPhoneNumber) => {
          res.json(savedPhoneNumber);
        });
      }
    })
    .catch((error) => {
      console.error("Issue with adding new phone number", error);
      res.status(500).json({ error: "Internal server error" });
    });
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
