import express, { Express, Request, Response, NextFunction, response } from 'express';
import dotenv from 'dotenv';
import "reflect-metadata";
import { Comment } from "./entity/Comment"
import { myDataSource } from "./data-source"

dotenv.config();

// Allowing POST requests from everywhere, including localhost.
// Warning: Using the wildcard to allow all sites to access a private API is a bad idea.
var allowCrossDomain = (req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', "*");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
}

// Establish database connection
myDataSource
    .initialize()
    .then(() => {
        console.log("Data Source has been initialized!")
    })
    .catch((err) => {
        console.error("Error during Data Source initialization:", err)
    })

// Create and setup Express App
const app: Express = express();
// I'm seeing this everywhere: app.use(express.json()). Why?
const port = process.env.PORT;

app.use(allowCrossDomain);

// START OF ROUTES
app.get("/comments", async (req: Request, res: Response) => {
  const comments = await myDataSource.manager.find(Comment)
  res.json(comments)
})

app.get("/comments/:post_id", async (req: Request, res: Response) => {
  const comments = await myDataSource.manager.findBy(Comment, {
    post_id: req.params.post_id
  })
  res.json(comments)
})

app.put("/comments/:post_id/:author/:content", async (req: Request, res: Response) => {
  const comment = new Comment()
  comment.post_id = req.params.post_id;
  comment.author = req.params.author;
  comment.content = req.params.content;
  await myDataSource.manager.save(comment)
  res.status(200).send("Comment was posted successfully!")
})

// start express server
app.listen(port)