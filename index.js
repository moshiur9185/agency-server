const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const fs = require("fs-extra");
const fileUpload = require("express-fileupload");
const MongoClient = require('mongodb').MongoClient;
require("dotenv").config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vakyo.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static("services"));
app.use(fileUpload());

const port = 5000;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const serviceCollection = client.db("agency").collection("services");
  const projectsCollection = client.db("agency").collection("projects");
  const adminCollection = client.db("agency").collection("admin");
    
  app.post("/addService", (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const price = req.body.price;
    const description = req.body.description;
    const newImg = file.data;
    const encImg = newImg.toString('base64')
    console.log(file, name, price, description)

    let image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, 'base64')
    }

    serviceCollection.insertOne({ name, price, description, image }).then((result) => {
      res.send(result.insertedCount > 0);
      console.log("result",result)
    });
  })

    //service get
    app.get("/services", (req, res) => {
      serviceCollection.find({})
      .toArray((err, documents) => {
        res.send(documents);
        // console.log(err,documents)
      });
    });

  //add portfolio
  app.post("/addProject", (req, res) => {
    const file = req.files.file;
    const title = req.body.title;
    const category = req.body.category;
    const description = req.body.description;
    const newImg = file.data;
  const encImg = newImg.toString("base64");

  let image = {
    contentType: file.mimetype,
    size: file.size,
    img: Buffer.from(encImg, "base64"),
  };

  projectsCollection.insertOne({title, category, description, image }).then((result) => {
    res.send(result.insertedCount > 0);
  });
})

//get portfolio
app.get("/projects", (req, res) => {
  projectsCollection.find({})
  .toArray((err, documents) => {
    res.send(documents);
    // console.log(err,documents)
  });
});

//Make admin
app.post("/makeAdmin", (req, res) => {
  const admin = req.body;
  // console.log("admin",admin);
  adminCollection.insertOne(admin).then((result) => {
    res.send(result.insertedCount > 0);
  });
});

//checkAdmin
app.post("/isAdmin", (req, res) => {
  const admin = req.body;
  const email = req.body.email;
  adminCollection.find({ email: email })
  .toArray((err, admins) => {
    res.send(admins.length > 0)
  });
});

});


app.get("/", (req, res) => {
    res.send("Working for agency");
});
  
app.listen(process.env.PORT || port);