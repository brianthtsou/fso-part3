require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const app = express();
const PhoneNumber = require('./models/phonenumber');

app.use(express.static('dist'));
app.use(express.json());
app.use(cors());

morgan.token('data', (req) => JSON.stringify(req.body));

const morganOptions = (req, res, next) => {
  if (req.method === 'POST') {
    morgan(
      ':method :url :status :res[content-length] - :response-time ms :data'
    )(req, res, next);
  } else {
    morgan('tiny')(req, res, next);
  }
};

app.use(morganOptions);

// error handler
const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  }
  if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message });
  }
  next(error);
};

// handler of requests with unknown endpoint
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
};

app.get('/api/persons', (request, response) => {
  PhoneNumber.find({}).then((phonenumbers) => {
    response.json(phonenumbers);
  });
});

app.get('/api/persons/info', async (request, response) => {
  const numPeople = await PhoneNumber.countDocuments();
  const currentDate = new Date();
  const utcString = currentDate.toISOString();
  response.send(
    `Phonebook has info for ${numPeople} people <br/><br/>${utcString}`
  );
});

app.get('/api/persons/:id', (request, response, next) => {
  PhoneNumber.findById(request.params.id)
    .then((phonenumber) => {
      if (!phonenumber) {
        return response
          .status(404)
          .send({ message: 'Phone number not found.' });
      }
      response.json(phonenumber);
    })
    .catch((error) => next(error));
});

app.delete('/api/persons/:id', (req, res, next) => {
  PhoneNumber.findByIdAndDelete(req.params.id)
    .then((res) => {
      res.status(204).end();
    })
    .catch((error) => {
      next(error);
    });
});

app.post('/api/persons', (req, res, next) => {
  const { body } = req;
  if (!body.name || !body.number) {
    return res.status(400).json({
      error: 'content missing',
    });
  }

  const person = new PhoneNumber({
    name: body.name,
    number: body.number,
  });

  person
    .save()
    .then((savedPhoneNumber) => {
      res.json(savedPhoneNumber);
    })
    .catch((error) => {
      next(error);
    });
});

app.put('/api/persons/:id', (request, response, next) => {
  const { body } = request;
  const person = {
    name: body.name,
    number: body.number,
  };

  PhoneNumber.findByIdAndUpdate(request.params.id, person, {
    new: true,
    runValidators: true,
    context: 'query',
  })
    .then((updatedPhoneNumber) => {
      response.json(updatedPhoneNumber);
    })
    .catch((error) => next(error));
});

app.use(unknownEndpoint);

app.use(errorHandler);

const { PORT } = process.env;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
