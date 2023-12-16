require("dotenv").config()
const express = require("express")
const app = express()
const Note = require("./models/note")
const cors = require("cors")

app.use(express.json())
app.use(cors())
app.use(express.static("dist"))

app.get("/api/notes", (request, response, next) => {
  Note.find({})
    .then((notes) => {
      response.json(notes)
    })
    .catch((error) => next(error))
})

app.get("/api/notes/:id", (request, response, next) => {
  Note.findById(request.params.id)
    .then((note) => {
      if (note) {
        response.json(note)
      } else {
        response.status(404).end() //not found (promise accepted but note not found)
      }
    })
    .catch((error) => next(error))
})

app.post("/api/notes", (request, response, next) => {
  const body = request.body

  const note = new Note({
    content: body.content,
    important: body.important || false,
  })

  note
    .save()
    .then((savedNote) => {
      response.json(savedNote)
    })
    .catch((error) => next(error))
})

app.put("/api/notes/:id", (request, response, next) => {
  const body = request.body

  const note = {
    content: body.content,
    important: body.important,
  }

  Note.findByIdAndUpdate(request.params.id, note, { new: true })
    .then((updatedNote) => {
      response.json(updatedNote)
    })
    .catch((error) => next(error))
})

app.delete("/api/notes/:id", (request, response, next) => {
  Note.findByIdAndDelete(request.params.id)
    .then((note) => {
      response.status(204).end()
    })
    .catch((error) => next(error))
})

const unknownEndpoint = (request, response, next) => {
  response.status(404).send({ error: "unknown endpoint" })
}
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.log(error.message)

  if (error.name === "CastError") {
    return response.status(400).send({ error: "Malformatted id" })
  }

  next(error) //passes error to the default error handler
}
app.use(errorHandler) //error middleware should be the last loaded middleware

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}...`)
})
