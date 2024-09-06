import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { User } from "../models/user.js";
import dotenv from "dotenv";
dotenv.config();

const secret = process.env.SECRET;
const params = {
	secretOrKey: secret,
	jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

// JWT Strategy
passport.use(
	new JwtStrategy(params, async (payload, done) => {
		try {
			const user = await User.findById(payload.id);

			if (!user) {
				return done(null, false, { message: "User not found" });
			}
			return done(null, user);
		} catch (err) {
			done(err, false);
		}
	})
);
export default passport;
