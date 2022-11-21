import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';

dotenv.config();

// Allowing POST requests from everywhere, including localhost.
// Warning: Using the wildcard to allow all sites to access a private API is a bad idea.
var allowCrossDomain = (req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', "*");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
}

const app: Express = express();

app.use(allowCrossDomain);

// Temporary data structure for comments.
// TODO: Move to a DB.
const comments= 
  [
    {
      'id': 'c00001',
      'author': 'John Green',
      'content': 'Always on point, needed a jolt here as I feel in between two of these jobs, just need to embrace where I am and keep learning and growing.',
      'post_id': 'copy'
    },
    {
      'id': 'c00002',
      'author': 'Hank Green',
      'content': 'Always on point, needed a bolt here as I feel in between two of these jobs, just need to embrace where I am and keep learning and thriving.',
      'post_id': 'copy'
    }
  ];

// START OF ROUTES
app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server is running.');
});

app.get('/comments', (req: Request, res: Response) => {
  const commentsToJSON = JSON.stringify(comments);
  res.send(commentsToJSON);
});

app.get('/comments/:post_id', (req: Request, res: Response) => {
  const commentsToJSON = JSON.stringify(comments.filter(comment => comment.post_id == req.params.post_id));
  res.send(commentsToJSON);
});

// Posting comments
app.post("/post/:post_id/:author/:content", function(req, res) {
  comments.push(
    {
      'id': 'c00003',
      'author': req.params.author,
      'content': req.params.content,
      'post_id': req.params.post_id
    }
  )
  res.send(comments)
})