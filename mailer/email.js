import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const { MAILGUN_USER, MAILGUN_PASS, SENDER_EMAIL } = process.env;

const transporter = nodemailer.createTransport({
	host: "smtp.mailgun.org",
	port: 2525,
	secure: false,
	auth: {
		user: MAILGUN_USER,
		pass: MAILGUN_PASS,
	},
});

const sendVerificationEmail = async (email, verificationToken) => {
	try {
		const info = await transporter.sendMail({
			from: SENDER_EMAIL,
			to: email,
			subject: "Verify your account",
			html: `<p>Please verify your email by clicking the following link: http://localhost:3000/users/verify/${verificationToken}</p>`,
		});

		return info;
	} catch (err) {
		throw err;
	}
};

export { sendVerificationEmail };
