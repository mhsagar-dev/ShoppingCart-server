const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { MongoClient } = require('mongodb');
require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.v9gjy.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;


const app = express()

app.use(bodyParser.json());
app.use(cors());

const port = 8000



const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const products = client.db("jagoShop").collection("products");
  const orders = client.db("jagoShop").collection("orders");

  console.log('db connectded')

  app.post('/addProducts', (req, res) => {
    const newProduct = req.body;
    console.log('added a product: ', newProduct);
    products.insertOne(newProduct)
      .then(result => {
        console.log('one inserted', result.insertedCount)
        res.send(res.insertedCount > 0)
      })
  })

  app.get('/products', (req, res) => {
    const search = req.query.search;
    products.find({name: {regex: search}})
      .toArray((err, items) => {
        res.send(items);
      }) 
  })

  app.get('/product/:key', (req, res) => {
    products.find({key: req.params.key})
      .toArray((err, items) => {
        res.send(items[0]);
      })
  })

  app.post('/productsByKeys', (req, res) => {
    const productKeys = req.body;
    products.find({key: { $in: productKeys}})
    .toArray((err, items) => {
      res.send(items);
    })
  })


  app.post('/addOrder', (req, res) => {
    const order = req.body;
    orders.insertOne(order)
      .then(result => {
        res.send(res.insertedCount > 0)
      })
  })


})



app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});