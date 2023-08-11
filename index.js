require("dotenv").config();
const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5500;

const cors = require("cors");

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://book-catalogue:bookcatalogue1218@cluster0.anool0g.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const run = async () => {
  try {
    const db = client.db("book-catalogue");
    const booksCollection = db.collection("books");
    const commentsCollection = db.collection("comments");
    const userCollection = db.collection("user");
    const loginCollection = db.collection("login");

    // app.get("/projects", async (req, res) => {
    //   const cursor = projectCollection.find();
    //   const project = await cursor.toArray();

    //   res.send({ status: true, data: project });
    // });

    app.get("/books", async (req, res) => {
      const cursor = booksCollection.find().limit(20);
      const result = await cursor.toArray();
      res.send(result);
    });

    const indexKeys = { BookTitle: 1 };
    const indexOptions = { BookTitle: "BookTitle" };
    const result = await booksCollection.createIndex(indexKeys, indexOptions);
    console.log(result);

    app.get("/booksNameSearch/:text", async (req, res) => {
      const text = req.params.text;
      // console.log(text)
      const result = await booksCollection
        .find({
          $or: [{ BookTitle: { $regex: text, $options: "i" } }],
        })
        .toArray();
      res.send(result);
    });

    app.post("/books", async (req, res) => {
      const project = req.body;

      const result = await booksCollection.insertOne(project);

      res.send(result);
    });

    app.get("/books/:id", async (req, res) => {
      const id = req.params.id;

      const result = await booksCollection.findOne({ _id: ObjectId(id) });
      console.log(result);
      res.send(result);
    });

    app.patch("/books/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateBook = req.body;
      const book = {
        $set: {
          title: updateBook.title,
        },
      };
      const result = await booksCollection.updateOne(filter, book, options);
      res.send(result);
    });

    app.delete("/books/:id", async (req, res) => {
      const id = req.params.id;

      const result = await booksCollection.deleteOne({ _id: ObjectId(id) });
      console.log(result);
      res.send(result);
    });

    // app.post("/comment", async (req, res) => {
    //   const comment = req.body;

    //   const result = await booksCollection.insertOne(comment);

    //   console.log(result);

    //   res.json({ message: "Comment added successfully" });
    //   res.send(result);
    // });
    // app.get("/comment", async (req, res) => {
    //   const cursor = booksCollection.find().limit(20);
    //   const result = await cursor.toArray();
    //   res.send(result);
    // });

    app.post("/comment/:id", async (req, res) => {
      const productId = req.params.id;
      const comment = req.body.comment;

      console.log(productId);
      console.log(comment);

      const result = await booksCollection.updateOne(
        { _id: ObjectId(productId) },
        { $push: { comments: comment } }
      );

      console.log(result);

      if (result.modifiedCount !== 1) {
        console.error("Product not found or comment not added");
        res.json({ error: "Product not found or comment not added" });
        return;
      }

      console.log("Comment added successfully");
      res.json({ message: "Comment added successfully" });
    });

    app.get("/comment/:id", async (req, res) => {
      const productId = req.params.id;

      const result = await booksCollection.findOne(
        { _id: ObjectId(productId) },
        { projection: { _id: 0, comments: 1 } }
      );

      if (result) {
        res.json(result);
      } else {
        res.status(404).json({ error: "Product not found" });
      }
    });

    app.post("/users", async (req, res) => {
      const user = req.body;

      const result = await userCollection.insertOne(user);

      res.send(result);
    });

    app.post("/login", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await loginCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "user already exists" });
      }
      const result = await loginCollection.insertOne(user);
      res.send(result);
    });
    app.get("/login", async (req, res) => {
      const user = req.body;

      const result = await loginCollection.insertOne(user);

      res.send(result);
    });
    app.get("/users", async (req, res) => {
      const cursor = userCollection.find().limit(20);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/user/:email", async (req, res) => {
      const email = req.params.email;

      const result = await userCollection.findOne({ email });

      if (result?.email) {
        return res.send({ status: true, data: result });
      }

      res.send({ status: false });
    });
  } finally {
  }
};

run().catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Hello Programmer");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
