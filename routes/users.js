import express from "express";
import Joi from "joi";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "../models/user.js";
import { auth } from "../models/auth.js";
import passport from "../config/config.js";

const secret = process.env.SECRET;

const userRouter = express.Router();

// Schemas
const schemaUser = Joi.object({
	email: Joi.string().email().required(),
	password: Joi.string().min(6).required(),
});

// Router
userRouter.post("/signup", async (req, res, next) => {
	const { email, password } = req.body;
	const { error } = schemaUser.validate({ email, password });
	if (error) {
		return res.status(400).json({
			status: "error",
			code: 400,
			message: error.details[0].message,
		});
	}
	try {
		const user = await User.findOne({ email }).lean();
		if (user) {
			return res.status(409).json({
				status: "error",
				code: 409,
				message: "Email in use",
			});
		}

		const hashedPassword = await bcrypt.hash(password, 10);
		const newUser = new User({
			email,
			password: hashedPassword,
			subscription: "starter",
		});
		await newUser.save();

		return res.status(201).json({
			status: "success",
			code: 201,
			data: {
				user: {
					email: newUser.email,
					subscription: newUser.subscription,
				},
			},
		});
	} catch (error) {
		next(error);
	}
});

userRouter.post("/login", async (req, res, next) => {
	const { email, password } = req.body;
	const { error } = schemaUser.validate({ email, password });
	if (error) {
		return res.status(400).json({
			status: "Bad request",
			code: 400,
			message: error.details[0].message,
		});
	}
	try {
		const user = await User.findOne({ email });

		if (!user || !user.validPassword(password)) {
			return res.status(401).json({
				status: "error",
				code: 401,
				message: "Email or password is wrong",
				data: "Unauthorized",
			});
		}

		const payload = {
			id: user.id,
			username: user.username,
		};
		const token = jwt.sign(payload, secret, { expiresIn: "1h" });

		res.status(200).json({
			status: "success",
			code: 200,
			data: {
				token: token,
				user: {
					email: user.email,
					subscription: user.subscription,
				},
			},
		});
	} catch (error) {
		next(error);
	}
});

userRouter.get("/logout", auth, async (req, res, next) => {
	try {
		const user = await User.findById(req.user.id);
		if (!user) {
			return res.status(401).json({
				status: "error",
				code: 401,
				message: "Not authorized",
			});
		}

		user.token = null;
		await user.save();

		res.status(204).send();
	} catch (error) {
		next(error);
	}
});

userRouter.get("/current", auth, async (req, res, next) => {
	try {
		const user = await User.findById(req.user.id);

		if (!user) {
			res.status(401).json({
				status: "error",
				code: 401,
				message: "Not authorized",
			});
		} else {
			res.status(200).json({
				status: "success",
				code: 200,
				data: { email: user.email, subscription: user.subscription },
			});
		}
	} catch (error) {
		next(error);
	}
});

export default userRouter;
