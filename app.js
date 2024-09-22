import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

// Create Express app
const app = express();
const server = http.createServer(app);

const corsOptions = {
  // origin: "https://chat-box-frontend-sigma.vercel.app/",
  origin: "https://swiftchat.b-cdn.net",
  // origin:"http://localhost:5173",
  methods: ["GET", "POST"],
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
};

app.use(cors(corsOptions));

// Middleware to parse JSON
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.send("Hello here");
});

// Import routers
import userRouter from './api/routes/userRouter.js';
import chatRouter from './api/routes/chatRouter.js';
import friendRouter from './api/routes/friendRouter.js';

// Use routers
app.use('/api', userRouter);
app.use('/api', chatRouter);
app.use('/api', friendRouter);

// Middleware to handle JSON parsing errors
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ message: "Invalid JSON" });
  }
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

export { app, server };
