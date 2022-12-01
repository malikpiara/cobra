import express, { Express, Request, Response, NextFunction } from 'express';
import { auth, requiredScopes } from 'express-oauth2-jwt-bearer';
import dotenv from 'dotenv';
import "reflect-metadata";
import { Comment } from "./entity/Comment";
import { myDataSource } from "./data-source";

dotenv.config();

// Allowing POST requests from everywhere, including localhost.
// Warning: Using the wildcard to allow all sites to access a private API is a bad idea.
var allowCrossDomain = (req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Credentials', "true");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, authorization');
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

// Going through Auth0 Quickstart from here until line 67.

// Authorization middleware. When used, the Access Token must
// exist and be verified against the Auth0 JSON Web Key Set.
const checkJwt = auth({
  audience: process.env.AUDIENCE,
  issuerBaseURL: process.env.ISSUER_BASE_URL
})

// This route doesn't need authentication
app.get('/api/public', (req: Request, res: Response) => {
  res.json({
    message: 'Hello from a public endpoint! You don\'t need to be authenticated to see this.'
  });
});

// This route needs authentication
// console.log(req.cookies.appSession)
app.get('/api/private', checkJwt, (req: Request, res: Response) => {
  //res.setHeader('authorization', req.cookies.appSession)
  res.json({
    message: 'Hello from a private endpoint! You need to be authenticated to see this.'
  });
});

const checkScopes = requiredScopes('read:comments');

app.get('/api/private-scoped', checkJwt, checkScopes, function(req, res) {
  res.json({
    message: 'Hello from a private endpoint! You need to be authenticated and have a scope of read:comments to see this.'
  });
});

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