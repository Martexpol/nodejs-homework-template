import express from "express";
import Joi from "joi";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "../../models/user.js";
import { auth } from "../../models/auth.js";
import { Blacklist } from "../../models/blacklist.js";
import pkg from "jimp";
const { Jimp } = pkg;
const app = express();

import gravatar from "gravatar";
import path from "path";
import { promises as fs } from "fs";
import multer from "multer";

import dotenv from "dotenv";
dotenv.config();

const secret = process.env.SECRET;

const userRouter = express.Router();

// Schemas
const schemaUser = Joi.object({
	email: Joi.string().email().required(),
	password: Joi.string().min(6).required(),
});

// For multer/avatar
const uploadDir = path.join(process.cwd(), "tmp");
const storeImage = path.join(process.cwd(), "public/avatars");

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, uploadDir);
	},
	filename: (req, file, cb) => {
		cb(null, file.originalname);
	},
	limits: {
		fileSize: 1048576 * 10,
	},
});

const upload = multer({
	storage: storage,
});

const isAccessible = (path) => {
	return fs
		.access(path)
		.then(() => true)
		.catch(() => false);
};

const createFolderIsNotExist = async (folder) => {
	if (!(await isAccessible(folder))) {
		await fs.mkdir(folder);
	}
};

const PORT = process.env.PORT || 3001;

app.listen(PORT, async () => {
	createFolderIsNotExist(uploadDir);
	createFolderIsNotExist(storeImage);
	console.log(`Server running. Use on port:${PORT}`);
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

		const avatarURL = gravatar.url(email, {
			s: "200",
			r: "pg",
			d: "mm",
		});

		const hashedPassword = await bcrypt.hash(password, 10);
		const newUser = new User({
			email,
			password: hashedPassword,
			subscription: "starter",
			avatarURL: avatarURL,
		});
		await newUser.save();

		return res.status(201).json({
			status: "success",
			code: 201,
			data: {
				user: {
					email: newUser.email,
					subscription: newUser.subscription,
					avatarURL: newUser.avatarURL,
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

		if (!user) {
			return res.status(401).json({
				status: "error",
				code: 401,
				message: "User doesn't exist",
				data: "Unauthorized",
			});
		}

		const passwordValid = await bcrypt.compare(password, user.password);
		if (!passwordValid) {
			return res.status(401).json({
				status: "error",
				code: 401,
				message: "Email or Wrong password",
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

		const blacklistedToken = new Blacklist({ token: req.token });
		await blacklistedToken.save();

		// user.token = null;
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
			return res.status(401).json({
				status: "error",
				code: 401,
				message: "Not authorized ",
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

// AVATAR
userRouter.patch(
	"/avatars",
	auth,
	upload.single("picture"),
	async (req, res, next) => {
		try {
			// Główna funkcja, w której będziesz sprawdzać 4 warunki

			// 1 - sprawdzenie autoryzacji
			const user = await User.findById(req.user.id);
			if (!user) {
				return res.status(401).json({
					status: "error",
					code: 401,
					message: "Not authorized",
				});
			} else {
				console.log("XXX user authorized");
			}

			// 2 - upload pliku (multer)
			//dekonstrukcja pliku
			const { path: temporaryName, originalname } = req.file;
			// wskazanie ścieżki do zapisu pliku
			const fileName = path.join(storeImage, originalname);
			// nowa unikalna nazwa pliku po zmianie
			const uniqueFileName = `${req.user.id}_${Date.now()}.jpg`;
			// nowa ścieżka pliku
			const finalFileName = path.join(storeImage, uniqueFileName);

			console.log("XXX temporaryName: ", temporaryName);
			console.log("XXX fileName: ", fileName);
			console.log("XXX uniqueFileName: ", uniqueFileName);
			console.log("XXX finalFileName: ", finalFileName);

			try {
				await fs.rename(temporaryName, fileName);
				console.log("zaladowano plik");
			} catch (err) {
				await fs.unlink(temporaryName);
				console.log("nie zaladowano pliku");
				return next(err);
			}

			// Warunek 3 - zmiana rozmiaru (jimp)
			async function resize() {
				try {
					const image = await Jimp.read(fileName);
					console.log("XXX image: ", image);
					image.resize(250, 250);
					await image.writeAsync(finalFileName);
					console.log("Obraz zapisany w:", finalFileName);
				} catch (error) {
					console.error("Błąd podczas zmiany rozmiaru obrazu:", error);
				}
			}
			await resize();

			// Warunek 4 - update uzytkownika
			try {
				user.avatarURL = finalFileName;
				await user.save();
				return res.status(200).json({
					status: "success",
					code: 200,
					message: { avatarURL: finalFileName },
				});
			} catch (error) {
				console.error("Błąd w warunku 4 - update uzytkownika:", error);
				return next(err);
			}
		} catch (error) {
			console.error("Error processing avatar upload:", error);
			next(error);
		}
	}
);

export default userRouter;
