// Function to generate a random session ID (or other tokens)
function generateRandomString(length) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Function to parse cookies and return a cookie object
function getCookies() {
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [name, value] = cookie.trim().split('=');
        acc[name] = value;
        return acc;
    }, {});
    return cookies;
}

// Function to check if user is logged in (based on cookies)
function isLoggedIn() {
    const cookies = getCookies();
    return cookies.username && cookies.sessionId;
}

// Handle login form submission
function login(event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // Get stored users from localStorage
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(u => u.username === username);

    if (user) {
        if (user.password === password) {
            const newSessionId = generateRandomString(32);
            document.cookie = `username=${username}; sessionId=${newSessionId}; max-age=604800; path=/`;
            localStorage.setItem("currentUser", username);
            window.location.href = "books.html";
        } else {
            alert("Incorrect password.");
        }
    } else {
        alert("Username not found.");
    }
}

// Handle signup form submission
function signup(event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const sessionId = generateRandomString(32);

    // Store user data in localStorage (or cookies)
    let users = JSON.parse(localStorage.getItem("users")) || [];
    users.push({ username, password, sessionId });
    localStorage.setItem("users", JSON.stringify(users));

    document.cookie = `username=${username}; sessionId=${sessionId}; max-age=604800; path=/`;
    localStorage.setItem("currentUser", username);
    window.location.href = "login.html";
}

// Handle logout functionality
function logout() {
    document.cookie = "username=; sessionId=; max-age=0; path=/";
    localStorage.removeItem("currentUser");
    window.location.reload();
}

// Handle book submission
// Handle book submission
function handleBookFormSubmission(event) {
    event.preventDefault();  // Prevent the form from submitting automatically

    const title = document.getElementById("title").value;
    const file = document.getElementById("image").files[0];  // New image file
    const currentUser = localStorage.getItem("currentUser");

    let books = JSON.parse(localStorage.getItem(currentUser + "_books")) || [];
    const index = document.getElementById("book-form").getAttribute("data-index");  // Get the index for editing

    // If a file is selected, process it
    if (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
            const imageBase64 = event.target.result;

            if (index !== null) {
                // If an index exists, update the existing book
                books[index] = { title, image: imageBase64 };
            } else {
                // If no index exists, add a new book
                books.push({ title, image: imageBase64 });
            }

            localStorage.setItem(currentUser + "_books", JSON.stringify(books));
            renderBooks(currentUser);  // Re-render the book list after submission

            // Reset the form and remove the data-index attribute
            document.getElementById("book-form").reset();
            document.getElementById("book-form").removeAttribute("data-index");
        };

        reader.readAsDataURL(file);  // Convert the image to Base64
    } else {
        // If no new file is selected, update the book without changing the image
        if (index !== null) {
            books[index] = { title, image: books[index].image };  // Keep the existing image
        } else {
            books.push({ title, image: "" });  // If no image is selected, save an empty string
        }

        localStorage.setItem(currentUser + "_books", JSON.stringify(books));
        renderBooks(currentUser);  // Re-render the book list after submission

        // Reset the form and remove the data-index attribute
        document.getElementById("book-form").reset();
        document.getElementById("book-form").removeAttribute("data-index");
    }
}


// Run the following when the document is loaded
document.addEventListener("DOMContentLoaded", () => {
    const bookForm = document.getElementById("book-form");
    const bookList = document.getElementById("book-list");
    const loginMessage = document.getElementById("login-message");
    const logoutButton = document.getElementById("logout-btn");
    const signupButton = document.getElementById("signup-btn");
    const loginButton = document.getElementById("login-btn");

    const currentUser = localStorage.getItem("currentUser");

    // Check if the user is logged in
    if (currentUser) {
        // Show book list and book form if logged in
        loginMessage.style.display = "none";
        bookForm.style.display = "block";
        bookList.style.display = "block";
        logoutButton.style.display = "inline-block"; // Show logout button
        loginButton.style.display = "none"; // Hide login button
        signupButton.style.display = "none"; // Hide signup button

        // Show books for the logged-in user
        renderBooks(currentUser);

        // Handle adding a new book
        bookForm.addEventListener("submit", handleBookFormSubmission);

        // Logout functionality
        logoutButton.addEventListener("click", logout);

    } else {
        // Show login message if user is not logged in
        loginMessage.style.display = "block";
        bookForm.style.display = "none";
        bookList.style.display = "none";
        loginButton.style.display = "inline-block"; // Show login button
        signupButton.style.display = "inline-block"; // Show signup button
    }
});

// Render books specific to the logged-in user
function renderBooks(currentUser) {
    const bookList = document.getElementById("book-list");
    const books = JSON.parse(localStorage.getItem(currentUser + "_books")) || [];
    bookList.innerHTML = ""; // Clear current book list

    books.forEach((book, index) => {
        const bookCard = document.createElement("div");
        bookCard.classList.add("book-card");

        // Add the edit button to each book
        bookCard.innerHTML = `
            <img src="${book.image || 'default-image.jpg'}" alt="Book Cover">
            <h3>${book.title}</h3>
            <button class="edit-btn" data-index="${index}">Edit</button>
            <button class="delete-btn" data-index="${index}">Delete</button>
        `;

        // Add edit button functionality
        const editButton = bookCard.querySelector(".edit-btn");
        editButton.addEventListener("click", () => {
            // Fill the form with the current book's details
            document.getElementById("title").value = book.title;
            document.getElementById("image").value = "";  // Image file input cannot be pre-filled, so we leave it empty

            // Store the index of the book being edited in a hidden form field (to identify which book to update)
            document.getElementById("book-form").setAttribute("data-index", index);
        });

        // Add delete button functionality
        const deleteButton = bookCard.querySelector(".delete-btn");
        deleteButton.addEventListener("click", () => {
            const books = JSON.parse(localStorage.getItem(currentUser + "_books")) || [];
            books.splice(index, 1);  // Remove the book from the array
            localStorage.setItem(currentUser + "_books", JSON.stringify(books));  // Save the updated list
            renderBooks(currentUser);  // Re-render the books
        });

        bookList.appendChild(bookCard);
    });
}

