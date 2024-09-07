import mongoose from "mongoose";

const { Schema } = mongoose;

const BlacklistSchema = new Schema({
	token: {
		type: String,
		required: true,
	},
	createdAt: {
		type: Date,
		default: Date.now,
		expires: "7d",
	},
});

// do sprawdzenia w razie czego
export const Blacklist = mongoose.model(
	"Blacklist",
	BlacklistSchema,
	"blacklist"
);
