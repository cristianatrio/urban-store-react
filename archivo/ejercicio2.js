const express = require("express")
const app = express()
const productos = require("./productos")


app.get('/productos', (req, res) => {
  res.json([
    { id: "1", nombre: "peras",precio :5,thumbnail:"url" },
    { id: "2", nombre: "sandias",precio :6,thumbnail:"url" },
  ])
})



const PRODUCTOS = []
let nextId = 0

function list() {
  return PRODUCTOS
}

function create(id,nombre,precio,thumbnail) {
  const productosNuevos = { id: "3", nombre: "NARANJAS",precio :150,thumbnail:"url" }
  PRODUCTOS.push(productosNuevos)
  nextId++

  return quote
}

module.exports = { list, create }

app.get('/PRODUCTOS', (req, res) => {
  res.json(PRODUCTOS.list())
})

app.post('/productos', (req, res) => {
  const { id, nombre,precio,thumbnail } = req.body
  const productos = productos.create(id, nombre,precio,thumbnail)
  res.json(productos)
})


app.patch('/productos/:id', (id, nombre,precio,thumbnail) => {
  const { id, nombre,precio,thumbnail } = req.body
  PRODUCTOS.edit(req.params.id, nombre, precio)
  res.status(204).send()
})

app.delete('/productos/:id', (req, res) => {
  PRODUCTOS.destroy(req.params.id)
  res.status(204).send()
})


app.listen(3000, () => console.log("Servidor listo ..."))


