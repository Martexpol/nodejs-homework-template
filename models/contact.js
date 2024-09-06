import mongoose from "mongoose";

const { Schema } = mongoose;

const ContactSchema = new Schema({
	name: {
		type: String,
		required: [true, "Set name for contact"],
	},
	email: {
		type: String,
	},
	phone: {
		type: String,
	},
	favorite: {
		type: Boolean,
		default: false,
	},
	owner: {
		type: Schema.Types.ObjectId,
		ref: "user",
		required: true,
	},
});

export const Contact = mongoose.model("contact", ContactSchema, "contacts");
