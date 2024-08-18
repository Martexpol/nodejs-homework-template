import express from "express";
import {
	listContacts,
	getContactById,
	addContact,
	removeContact,
	updateContact,
	updateStatusContact,
} from "../../models/contacts.js";
import Joi from "joi";

const router = express.Router();

// Schemas
const schemaPost = Joi.object({
	name: Joi.string()
		.regex(/^[a-zA-Z\s]+$/)
		.min(3)
		.max(30)
		.required(),
	email: Joi.string()
		.email({
			minDomainSegments: 2,
			tlds: { allow: ["com", "net"] },
		})
		.required(),
	phone: Joi.string()
		.regex(/^\(\d{3}\) \d{3}-\d{4}$/)
		.required(),
});

const schemaPatch = Joi.object({
	name: Joi.string()
		.regex(/^[a-zA-Z\s]+$/)
		.min(3)
		.max(30),
	email: Joi.string().email({
		minDomainSegments: 2,
		tlds: { allow: ["com", "net"] },
	}),
	phone: Joi.string().regex(/^\(\d{3}\) \d{3}-\d{4}$/),
}).or("name", "email", "phone");

const schemaPatchFavorite = Joi.object({
	favorite: Joi.boolean().required(),
});

// Validation
const validateBody = (schema) => (req, res, next) => {
	const { error } = schema.validate(req.body);
	if (error) {
		return res.status(400).json({
			code: 400,
			message: error.details[0].message,
		});
	}
	next();
};

// Router
router.get("/", async (req, res, next) => {
	try {
		const contacts = await listContacts();
		res.status(200).json({
			status: "success",
			code: 200,
			data: { contacts },
		});
	} catch (error) {
		next(error);
	}
});

router.get("/:contactId", async (req, res, next) => {
	try {
		const { contactId } = req.params;
		const contact = await getContactById(contactId);

		if (contact) {
			res.status(200).json({
				status: "success",
				code: 200,
				data: { contact },
			});
		} else {
			res.status(404).json({
				status: "Not Found",
				code: 404,
			});
		}
	} catch (error) {
		next(error);
	}
});

router.post("/", validateBody(schemaPost), async (req, res, next) => {
	try {
		const { name, email, phone } = req.body;

		const newContact = await addContact({ name, email, phone });
		res.status(201).json({
			status: "success",
			code: 201,
			data: { newContact },
		});
	} catch (error) {
		next(error);
	}
});

router.delete("/:contactId", async (req, res, next) => {
	try {
		const { contactId } = req.params;
		const contact = await removeContact(contactId);

		if (!contact) {
			res.status(404).json({
				status: "Not Found",
				code: 404,
			});
		} else {
			res.status(200).json({
				status: "Contact deleted",
				code: 200,
			});
		}
	} catch (error) {
		next(error);
	}
});

router.put("/:contactId", validateBody(schemaPatch), async (req, res, next) => {
	try {
		const { contactId } = req.params;
		const body = req.body;

		if (!body || Object.keys(body).length === 0) {
			return res.status(400).json({
				code: 400,
				message: "Missing fields",
			});
		}

		const contact = await updateContact(contactId, body);
		if (!contact) {
			res.status(404).json({
				status: "Not Found",
				code: 404,
			});
		} else {
			res.status(200).json({
				status: "Contact updated",
				code: 200,
				data: { contact },
			});
		}
	} catch (error) {
		next(error);
	}
});

router.patch(
	"/:contactId/favorite",
	validateBody(schemaPatchFavorite),
	async (req, res, next) => {
		try {
			const { contactId } = req.params;
			const { favorite } = req.body;

			if (favorite === undefined) {
				return res.status(400).json({
					code: 400,
					message: "Missing field favorite",
				});
			}

			const contact = await updateStatusContact(contactId, favorite);

			if (!contact) {
				return res.status(404).json({
					status: "Not Found",
					code: 404,
					message: "Contact not found",
				});
			} else {
				return res.status(200).json({
					status: "success",
					code: 200,
					data: { contact },
				});
			}
		} catch (error) {
			next(error);
		}
	}
);

export default router;
