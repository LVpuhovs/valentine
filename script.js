document.addEventListener("DOMContentLoaded", () => {
    const bookForm = document.getElementById("book-form");
    const bookList = document.getElementById("book-list");
    const imageInput = document.getElementById("image");

    let books = JSON.parse(localStorage.getItem("books")) || [];

    function saveBooks() {
        localStorage.setItem("books", JSON.stringify(books));
    }

    function renderBooks() {
        bookList.innerHTML = "";
        books.forEach((book, index) => {
            const bookCard = document.createElement("div");
            bookCard.classList.add("book-card");
            bookCard.innerHTML = `
                <img src="${book.image}" alt="Book Cover">
                <h3>${book.title}</h3>
                <button onclick="editBook(${index})">Edit</button>
                <button onclick="deleteBook(${index})">Delete</button>
            `;
            bookList.appendChild(bookCard);
        });
    }

    bookForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const title = document.getElementById("title").value;
        const file = imageInput.files[0];

        if (file) {
            const reader = new FileReader();
            reader.onload = function (event) {
                const imageBase64 = event.target.result;
                books.push({ title, image: imageBase64 });
                saveBooks();
                renderBooks();
                bookForm.reset();
            };
            reader.readAsDataURL(file); // Convert to Base64
        }
    });

    window.editBook = (index) => {
        const newTitle = prompt("Enter new book title:", books[index].title);
        if (newTitle) {
            books[index].title = newTitle;
            saveBooks();
            renderBooks();
        }
    };

    window.deleteBook = (index) => {
        books.splice(index, 1);
        saveBooks();
        renderBooks();
    };

    renderBooks();
});



