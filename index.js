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

app.delete("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  persons = persons.filter((person) => person.id !== id);
  res.status(204).end();
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

  const match = persons.find((person) => {
    return body.name.toLowerCase() === person.name.toLowerCase();
  });

  if (match) {
    return res.status(409).json({
      error: "name must be unique",
    });
  }

  const person = {
    id: generateId(),
    name: body.name,
    number: body.number,
  };

  persons = persons.concat(person);

  res.json(persons);
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
