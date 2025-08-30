import express from "express";
import authControllers from "../controllers/auth-controller.js";
import { signupSchema, signinSchema } from "../validators/auth-validator.js";
import validate from "../middleware/validate-middleware.js";
import authMiddleware from "../middleware/auth-middleware.js";

const router = express.Router();

router.route("/signup").post(validate(signupSchema), authControllers.register);
router.route("/login").post(validate(signinSchema), authControllers.login);
router.route("/logout").post(authMiddleware, authControllers.logout);

export default router;
