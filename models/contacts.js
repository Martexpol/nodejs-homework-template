import { Contact } from "./contact.js";

const listContacts = async () => {
	try {
		const contacts = await Contact.find();
		return contacts;
	} catch (error) {
		throw new Error("Failed to load contacts");
	}
};

const getContactById = async (contactId) => {
	try {
		const contact = await Contact.findById(contactId);
		return contact || null;
	} catch (error) {
		throw new Error("Failed to retrieve contact by ID");
	}
};

const addContact = async (body) => {
	try {
		const newContact = await Contact.create(body);
		return newContact;
	} catch (error) {
		throw new Error("Failed to add new contact");
	}
};

const removeContact = async (contactId) => {
	try {
		const removedContact = await Contact.findByIdAndDelete(contactId);
		return removedContact || null;
	} catch (error) {
		throw new Error("Failed to remove contact");
	}
};
const updateContact = async (contactId, body) => {
	try {
		const updatedContact = await Contact.findByIdAndUpdate(contactId, body, {
			new: true,
		});

		return updatedContact || null;
	} catch (error) {
		throw new Error("Failed to update contact");
	}
};

const updateStatusContact = async (contactId, favorite) => {
	try {
		const updatedContact = await Contact.findByIdAndUpdate(
			contactId,
			{ favorite },
			{ new: true }
		);
		return updatedContact;
	} catch (error) {
		throw new Error("Failed to update contact");
	}
};

export {
	listContacts,
	getContactById,
	removeContact,
	addContact,
	updateContact,
	updateStatusContact,
};
