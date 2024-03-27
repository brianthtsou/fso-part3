const express = require("express");
const morgan = require("morgan");
const app = express();

app.use(express.json());

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

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

app.get("/api/info", (request, response) => {
  const numPeople = persons.length;
  const currentDate = new Date();
  const utcString = currentDate.toISOString();
  response.send(
    `Phonebook has info for ${numPeople} people <br/><br/>${utcString}`
  );
});

app.get("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  const person = persons.find((person) => person.id === id);
  if (person) {
    res.json(person);
  } else {
    res.status(404).end();
  }
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

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
