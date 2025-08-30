import dotenv from "dotenv";
import express from "express";
import {connectDB} from './utils/db.js';
import cors from 'cors';
import auth from './routers/auth-router.js';
import review from './routers/review-router.js';
import user from './routers/user-router.js';

dotenv.config();
const app = express();

app.use(cors({
  origin: [
    "http://localhost:3000", 
    "http://localhost:5173",
    "https://resume-reviewer-kappa.vercel.app/"
  ],
  credentials: true
}));

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
