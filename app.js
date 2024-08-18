import mongoose from "mongoose";
import express from "express";
import logger from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import router from "./routes/api/contacts.js";

dotenv.config();
const app = express();

const formatsLogger = app.get("env") === "development" ? "dev" : "short";

app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());

app.use("/api/contacts", router);

app.use((req, res) => {
	res.status(404).json({ message: "Not found" });
});

app.use((err, req, res, next) => {
	res.status(500).json({ message: err.message });
});

const port = process.env.PORT || 3001;

mongoose
	.connect(process.env.DATABASE_URL)
	.then(() => {
		console.log("Database connection successful");
		app.listen(port, () => {
			console.info(`Server running on port ${port}`);
		});
	})
	.catch((error) => {
		console.error("Database connection error:", error.message);
		process.exit(1);
	});
export default app;
