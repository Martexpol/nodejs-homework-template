const fs = require("fs/promises");
const { nanoid } = require("nanoid");
const path = require("path");
const contactsPath = path.join(__dirname, "contacts.json");

const listContacts = async () => {
	try {
		const data = await fs.readFile(contactsPath, "utf-8");
		const contacts = JSON.parse(data);
		return contacts;
	} catch (error) {
		throw new Error("Failed to load contacts");
	}
};

const getContactById = async (contactId) => {
	try {
		const contacts = await listContacts();
		const contact = contacts.find((contact) => contact.id === contactId);
		return contact || null;
	} catch (error) {
		throw new Error("Failed to retrieve contact by ID");
	}
};

const addContact = async (body) => {
	try {
		const { name, email, phone } = body;
		const contacts = await listContacts();

		const newContact = {
			id: nanoid(),
			name,
			email,
			phone,
		};

		contacts.push(newContact);

		await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));
		return newContact;
	} catch (error) {
		throw new Error("Failed to add new contact");
	}
};

const removeContact = async (contactId) => {
	try {
		const contacts = await listContacts();
		const index = contacts.findIndex((contact) => contact.id === contactId);
		if (index === -1) {
			return null;
		}

		const [removedContact] = contacts.splice(index, 1);

		await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));
		return removedContact;
	} catch (error) {
		throw new Error("Failed to remove contact");
	}
};
const updateContact = async (contactId, body) => {
	try {
		const contacts = await listContacts();
		const index = contacts.findIndex((contact) => contact.id === contactId);
		if (index === -1) {
			return null;
		}

		contacts[index] = { ...contacts[index], ...body };
		await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));

		return contacts[index];
	} catch (error) {
		throw new Error("Failed to update contact");
	}
};

module.exports = {
	listContacts,
	getContactById,
	removeContact,
	addContact,
	updateContact,
};
