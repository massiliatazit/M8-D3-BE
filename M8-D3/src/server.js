const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const genericErrorHandler = require("./errorHandler");

const articleRoute = require("./articles");
const authorRoute = require("./authors");

const server = express();
const port = process.env.PORT;

server.use(cors());
server.use(express.json());

server.use("/articles", articleRoute);
server.use("/authors", authorRoute);

server.use(genericErrorHandler);


  mongoose
  .connect(process.env.MONGO_CONNECTION, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
  })
  .then(
      server.listen(port, () => {
          console.log("Running on port", port)
      })
  )
  .catch(err => console.log(err))