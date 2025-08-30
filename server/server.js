import dotenv from "dotenv";
import express from "express";
import {connectDB} from './utils/db.js';
import cors from 'cors';
import auth from './routers/auth-router.js';
import review from './routers/review-router.js';
import user from './routers/user-router.js';

dotenv.config();
const app = express();

const allowedOrigins = [
  "http://localhost:3000", 
  "http://localhost:5173",
  "https://resume-reviewer-kappa.vercel.app" // ✅ No trailing slash
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

app.options('*', cors(corsOptions));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', auth);
app.use('/api/review', review);
app.use('/api/users', user);

app.get('/api/health', (req, res) => {
  res.json({ message: 'API is running!' });
});

const PORT = process.env.PORT || 4000;
const uri = process.env.MONGODB_URI;

connectDB(uri).then(() => {
  app.listen(PORT, () => {
    console.log("🚀 API server running on port", PORT);
  });
});
