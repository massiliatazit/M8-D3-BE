const express = require("express");
const AuthorModel = require("./schema");
const AuthorSchema = require("./schema");
const { authenticate, authorize } = require("../authTools");

const authorRouter = express.Router();

authorRouter.get("/", authorize, async (req, res, next) => {
  try {
    if (req.query.name) {
      const author = await AuthorSchema.findOne({ name: req.query.name });
      if (author) {
        res.status(200).send(author);
      } else {
        res.status(404).send("this author doesn't exist");
      }
    } else {
      const allAuthors = await AuthorSchema.find();
      res.status(200).send(allAuthors);
    }
  } catch (error) {
    console.log(error);
    res.send("Something went wrong");
  }
});

authorRouter.post("/register", async (req, res) => {
  try {
    const newAuthor = new AuthorSchema(req.body);
    const { _id } = await newAuthor.save();
    res.status(201).send(_id);
  } catch (error) {
    console.log(error);
    res.send("Something went wrong");
  }
});

authorRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const author = await AuthorModel.findByCrendor(email, password);
    const tokens = await authenticate(author);
    res.send(tokens);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

authorRouter.get("/:id", authorize, async (req, res) => {
  try {
    const selectedAuthor = await AuthorSchema.findById(req.params.id).populate(
      "articles"
    );
    if (selectedAuthor) {
      res.status(200).send(selectedAuthor);
    } else {
      res.status(404).send("We couldn't find an author with that id");
    }
  } catch (error) {
    console.log(error);
    res.send("Something went wrong");
  }
});

authorRouter.delete("/:id", authorize, async (req, res) => {
  try {
    const author = await AuthorSchema.findByIdAndDelete(req.params.id);
    if (author) {
      res.send("Author deleted");
    } else {
      res.status(404).send("Author not found");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

authorRouter.put("/:id", authorize, async (req, res) => {
  try {
    const author = await AuthorSchema.findByIdAndUpdate(
      req.params.id,
      req.body,
      { runValidators: true, new: true }
    );
    if (author) {
      res.send(author);
    } else {
      res.status(404).send("article not found");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

authorRouter.post("/refreshToken", async (req, res, next) => {
  const oldRefresh = req.body.refreshToken;
  if (!oldRefresh) {
    const err = new Error("No refresh token");
    err.httpStatusCode = 400;
    next(err);
  } else {
    try {
      const newTokens = await refreshToken(oldRefresh);
      res.send(newTokens);
    } catch (error) {
      console.log(error);
      const err = new Error(error);
      err.httpStatusCode = 403;
      next(err);
    }
  }
});

module.exports = authorRouter;
