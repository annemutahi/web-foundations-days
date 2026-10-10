const loadUsersButton = document.getElementById("load-users");
const filterInput = document.getElementById("filter-input");
const statusMessage = document.getElementById("status");
const usersList = document.getElementById("users-list");

let users = [];

function renderUsers(list) {
	usersList.replaceChildren();

	list.forEach((user) => {
		const userItem = document.createElement("li");
		const name = document.createElement("h2");
		const email = document.createElement("p");
		const city = document.createElement("p");
		const company = document.createElement("p");

		name.textContent = user.name;
		email.textContent = `Email: ${user.email}`;
		city.textContent = `City: ${user.address.city}`;
		company.textContent = `Company: ${user.company.name}`;

		userItem.append(name, email, city, company);
		usersList.append(userItem);
	});

	statusMessage.textContent = list.length === 0
		? "No users match your filter."
		: `Showing ${list.length} of ${users.length} users.`;
}

async function loadUsers() {
	loadUsersButton.disabled = true;
	statusMessage.textContent = "Loading users...";

	try {
		const response = await fetch("https://jsonplaceholder.typicode.com/users");

		if (!response.ok) {
			throw new Error(`Request failed with status ${response.status}.`);
		}

		const fetchedUsers = await response.json();

		if (!Array.isArray(fetchedUsers)) {
			throw new Error("The server returned an invalid user list.");
		}

		users = fetchedUsers;
		renderUsers(users);
	} catch (error) {
		statusMessage.textContent = `Could not load users. ${error.message}`;
	} finally {
		loadUsersButton.disabled = false;
	}
}

loadUsersButton.addEventListener("click", loadUsers);
filterInput.addEventListener("input", () => {
	if (users.length > 0) {
		const searchTerm = filterInput.value.trim().toLowerCase();
		const matchingUsers = users.filter((user) =>
			user.name.toLowerCase().includes(searchTerm)
		);
		renderUsers(matchingUsers);
	}
});
