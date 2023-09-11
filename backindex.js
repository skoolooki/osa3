require('dotenv').config()
const express = require("express")
const app = express()
const cors = require('cors')
const phonePersons = require('/modules/mongoose.js')

app.use(express.static('build'))
app.use(cors())
app.use(express.json())

// Persons in json
app.get('/api/persons', (request, response) => {
    phonePersons.find({}).then(person => {
        response.json(person)
    })
})

// Uusi person
app.post('/api/persons', (request, response) => {
  const body = request.body
  
  if (body.content === undefined) {
    return response.status(400).json({ error: "content missing"})
  }

  const person = new phonePersons ({
    name: body.name,
    number: body.number,
  })

  person.save().then(savedPerson => {
    response.json(savedPerson)
  }).catch(error => next(error))
})

// 1 Person
app.get('/api/persons/:id', (request, response, next) => {
  phonePersons.findById(request.params.id).then(person => {
    response.json(person)
  }).catch(error => next(error))
})


// Delete Person
app.delete("/api/persons/:id", (request, response) => {
  phonePersons.findByIdAndRemove(request.params.id).then(()=> {
    response.status(204).end()
  }).catch(error => next(error))
})


// Errors
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

