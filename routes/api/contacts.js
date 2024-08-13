const express = require("express");
const {
	listContacts,
	getContactById,
	addContact,
	removeContact,
	updateContact,
} = require("../../models/contacts");

const router = express.Router();
const Joi = require("joi");

const schema = Joi.object({
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
		.regex(/^\+?\d{6,11}$/)
		.required(),
});

const validateBody = (req, res, next) => {
	const { error } = schema.validate(req.body);
	if (error) {
		return res.status(400).json({
			code: 400,
			message: error.details[0].message,
		});
	}
	next();
};

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

router.post("/", validateBody, async (req, res, next) => {
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

router.put("/:contactId", validateBody, async (req, res, next) => {
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

module.exports = router;
