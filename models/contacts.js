import { Contact } from "./contact.js";

const listContacts = async (ownerId) => {
	try {
		const contacts = await Contact.find({ owner: ownerId });
		return contacts;
	} catch (error) {
		throw new Error("Failed to load contacts");
	}
};

const getContactById = async (contactId, ownerId) => {
	try {
		const contact = await Contact.findById({ _id: contactId, owner: ownerId });
		return contact || null;
	} catch (error) {
		throw new Error("Failed to retrieve contact by ID");
	}
};

const addContact = async (body, ownerId) => {
	try {
		const newContact = await Contact.create({ ...body, owner: ownerId });
		return newContact;
	} catch (error) {
		throw new Error("Failed to add new contact");
	}
};

const removeContact = async (contactId, ownerId) => {
	try {
		const removedContact = await Contact.findByIdAndDelete({
			_id: contactId,
			owner: ownerId,
		});
		return removedContact || null;
	} catch (error) {
		throw new Error("Failed to remove contact");
	}
};
const updateContact = async (contactId, body, ownerId) => {
	try {
		const updatedContact = await Contact.findByIdAndUpdate(
			{ _id: contactId, owner: ownerId },
			body,
			{ new: true }
		);

		return updatedContact || null;
	} catch (error) {
		throw new Error("Failed to update contact");
	}
};

const updateStatusContact = async (contactId, favorite, ownerId) => {
	try {
		const updatedContact = await Contact.findByIdAndUpdate(
			{ _id: contactId, owner: ownerId },
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
