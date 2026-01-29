require('dotenv').config();
const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');

// middleware
app.use(cors());
app.use(express.json());



const uri = process.env.MONGODB_URL;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7

    const usersCollection = client.db("tasteTailDB").collection("Users");
    const categoriesCollection = client.db("tasteTailDB").collection("Category");

    app.get("/user", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    })

    // login system
    app.post("/loginPoint", async (req, res) => {
      const {email, password} = req.body;
      const user = await usersCollection.findOne({email});

      if (!user) {
        res.send(null);
        return
      }

      const isPassword = await bcrypt.compare(password, user?.password);
      
      if (isPassword) {
        res.send(user);
      }else{
        res.send(null);
      }
      
    })

    // registration
    app.post("/registrationRoute", async (req, res) => {
      const data = req.body;

      const existUser = await usersCollection.findOne({ email: data.email });
      if (existUser) {
        res.send({
          success: false,
          insertedId: null
        });
        return;
      }

      const {password, ...remain} = data;
      const hashPassword = await bcrypt.hash(password, 10);
      const newData = {password: hashPassword, ...remain};
      const result = await usersCollection.insertOne(newData);
      res.status(200).send(result);
    })

    // category
    app.get("/category", async (req, res) => {
      const result = await categoriesCollection.find().toArray();
      res.send(result);
    })

    app.get("/categoryOne/:id", async (req, res) => {
      const {id} = req.params;
      const result = await categoriesCollection.findOne({_id: new ObjectId(id)});
      res.send(result);
    })

    app.patch("/category/:id", async (req, res) => {
      const {id} = req.params;
      const data = req.body;
      const result = await categoriesCollection.updateOne(
        {_id: new ObjectId(id)},
        {$set: data}
      );

      res.send(result);
    })

    app.post("/category", async (req, res) => {
      const category = req.body;
      const result = await categoriesCollection.insertOne(category);
      res.send(result);
    })

    app.delete("/category/:id", async (req, res) => {
      const {id} = req.params;
      const result = await categoriesCollection.deleteOne({_id: new ObjectId(id)});
      res.send(result);

    })


    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {

  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
