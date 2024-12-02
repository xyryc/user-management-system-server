const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.t08r2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  // try {
  //   // Connect the client to the server	(optional starting in v4.7)
  //   await client.connect();

  // user apis
  const usersCollection = client.db("usersDB").collection("users");

  app.get("/users", async (req, res) => {
    const cursor = usersCollection.find();
    const result = await cursor.toArray();
    res.send(result);
  });

  app.get("/users/:id", async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await usersCollection.findOne(query);
    res.send(result);
  });

  app.post("/users", async (req, res) => {
    const newUser = req.body;

    const result = await usersCollection.insertOne(newUser);
    res.send(result);
  });

  app.put("/users/:id", async (req, res) => {
    const id = req.params.id;
    const updatedUser = req.body;
    // console.log(updatedUser);

    const filter = { _id: new ObjectId(id) };
    const options = { upsert: true };

    const user = {
      $set: {
        name: updatedUser.name,
        email: updatedUser.email,
        job: updatedUser.job,
      },
    };

    const result = await usersCollection.updateOne(filter, user, options);
    res.send(result);
  });

  app.patch("/users/:id", async (req, res) => {
    const id = req.params.id;
    const updateStatus = req.body;

    const query = { _id: new ObjectId(id) };
    const update = {
      $set: {
        isPaid: updateStatus.isPaid,
      },
    };

    const result = await usersCollection.updateOne(query, update);
    res.send(result);
  });

  app.delete("/users/:id", async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await usersCollection.deleteOne(query);
    res.send(result);
  });

  // Send a ping to confirm a successful connection
  await client.db("admin").command({ ping: 1 });
  console.log("Pinged your deployment. You successfully connected to MongoDB!");
  // } finally {
  //   // Ensures that the client will close when you finish/error
  //   // await client.close();
  // }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("user server running");
});

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
