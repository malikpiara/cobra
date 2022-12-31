import express, { Express, Request, Response, NextFunction } from 'express';
import { auth, requiredScopes } from 'express-oauth2-jwt-bearer';
import dotenv from 'dotenv';
import "reflect-metadata";
import { Comment } from "./entity/Comment";
import { Like } from "./entity/Like";
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
app.get('/api/private', checkJwt, (req: Request, res: Response) => {
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
  const comments = await myDataSource.manager.find(Comment, {
    order: {createdAt: "DESC"}
  })
  res.json(comments)
})

// Finding all comments for a given Moonwith blog post.
app.get("/comments/:post_id", async (req: Request, res: Response) => {
  const comments = await myDataSource.manager.find(Comment, {
    where: {post_id: req.params.post_id, isDeleted: false},
    order: {createdAt: "DESC"}
  });
  res.json(comments)
})

app.get("/comment/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const comments = await myDataSource.manager.findOne(Comment, {
    where: {id: parseInt(id)}
  }
  );
  res.json(comments)
})

// TODO: Create scoping so that only admins can call this endpoint.
app.put("/delete/comment/:id", checkJwt, async (req: Request, res: Response) => {
  await myDataSource
    .createQueryBuilder()
    .update(Comment)
    .set({ isDeleted: true })
    .where("id = :id", { id: req.params.id })
    .execute()
    res.status(200).send({response: "Comment was deleted successfully!"})
})

app.post("/comments/:post_id/:user_id/:author/:content", checkJwt, async (req: Request, res: Response) => {
  const comment = new Comment()
  comment.post_id = req.params.post_id;
  comment.user_id = req.params.user_id;
  comment.author = req.params.author;
  comment.content = req.params.content;
  await myDataSource.manager.save(comment)
  res.status(200).send({response:"Comment was posted successfully!"})
})

// START of Like
app.get("/likes", async (req: Request, res: Response) => {
  const Likes = await myDataSource.manager.find(Like)
  res.json(Likes)
})

// Finding all likes for a given Moonwith blog post.
app.get("/likes/:postId", async (req: Request, res: Response) => {
  const likes = await myDataSource.manager.find(Like, {
    where: {postId: req.params.postId, isRemoved: false}
  });
  res.json(likes)
})

// I should check if the userId is already there
// to avoid duplicated likes?
app.post("/likes/:postId/:userId", checkJwt, async (req: Request, res: Response) => {
  try {
    const like = new Like()
    like.postId = req.params.postId;
    like.userId = req.params.userId;
    await myDataSource.manager.save(like)
    res.status(200).send({response:"Like was posted successfully."})
  } catch(error) {
    res.status(500).send({response: "Error. There's already a Like entry with the same userId and postId."})
  }
})

// This endpoint updates the like status for when
// a user decides to remove a like from a blog post.
app.delete("/likes/:id", checkJwt, async (req: Request, res: Response) => {
  await myDataSource
    .createQueryBuilder()
    //.update(Like)
    //.set({ isRemoved: true  })
    .delete()
    .from(Like)
    .where("id = :id", { id: req.params.id })
    .execute()
    res.status(200).send({response: "Success! Like was removed."})
})

// start express server
app.listen(port)