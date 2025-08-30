import dotenv from "dotenv";
import express from "express";
import {connectDB} from './utils/db.js';
import cors from 'cors';
import errorMiddleware from './middleware/error-middleware.js';
import auth from './routers/auth-router.js';
import review from './routers/review-router.js';
import user from './routers/user-router.js';
import path from 'path';

const app = express();


dotenv.config();

const allowedOrigins = [
  "http://localhost:5173", // Your React app URL
  "http://localhost:3000"  // For development
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true); // Allow the request if the origin is in the allowed list
    } else {
      callback(new Error("Not allowed by CORS")); // Reject the request otherwise
    }
  },
  methods: "GET, POST, PUT, DELETE, PATCH, HEAD",
  credentials: true,
  allowedHeaders: "Content-Type, Authorization",
};

// Use the correct CORS options
app.use(cors(corsOptions));

const __dirname = path.resolve();

process.setMaxListeners(0); 

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Resume Reviewer API is running!', 
    timestamp: new Date().toISOString() 
  });
});


app.use('/api/auth', auth);
app.use('/api/review', review);
app.use('/api/users', user);

app.use(errorMiddleware);

const PORT = process.env.PORT || 4000;

const uri = process.env.MONGODB_URI;

if(process.env.NODE_ENV==="production"){
  app.use(express.static(path.join(__dirname, "../client/dist")))

  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, "../client", "dist", "index.html"))
  })
}

connectDB(uri).then(() => {
  app.listen(PORT, () => {
    console.log("Connected to Database, running on port ", PORT);
  });
});
