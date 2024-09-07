import passport from "passport";
import { Blacklist } from "./blacklist.js";

const auth = async (req, res, next) => {
	try {
		const authHeader = req.header("Authorization");

		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			return res.status(401).json({
				status: "error",
				code: 401,
				message: "Not authorized - No token provided",
			});
		}

		const token = authHeader.replace("Bearer ", "").trim();

		const blacklistedToken = await Blacklist.findOne({ token });

		if (blacklistedToken) {
			return res.status(401).json({
				status: "error",
				code: 401,
				message: "Not authorized - Invalid token",
			});
		}

		passport.authenticate("jwt", { session: false }, (err, user) => {
			if (!user || err) {
				console.error("Authentication error:", err);
				return res.status(401).json({
					status: "error",
					code: 401,
					message: "Not authorized",
					data: "Unauthorized",
				});
			}

			req.user = user;
			req.token = token;
			next();
		})(req, res, next);
	} catch (error) {
		console.error("Catch block error:", error);
		return res.status(401).json({
			status: "error",
			code: 401,
			message: "Not authorized",
			data: "Unauthorized",
		});
	}
};
export { auth };
