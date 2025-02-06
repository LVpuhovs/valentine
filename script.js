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

document.getElementById("scan-button").addEventListener("click", function() {
    window.location.href = 'google.com/search?q=barcode';
});
document.getElementById("scan-button").addEventListener("click", function() {
    window.location.href = 'itms://itunes.apple.com/app/qr-scanner/id368494118';
});


document.getElementById("fetch-details").addEventListener("click", function() {
    const isbn = document.getElementById("isbn").value;
    if (!isbn) return alert("Please scan an ISBN first!");

    fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`)
        .then(response => response.json())
        .then(data => {
            if (data.totalItems > 0) {
                const book = data.items[0].volumeInfo;
                document.getElementById("title").value = book.title;
                document.getElementById("image").src = book.imageLinks?.thumbnail || "";
            } else {
                alert("Book not found!");
            }
        })
        .catch(error => console.error("Error fetching book info:", error));
});

document.getElementById("use-scanner-app").addEventListener("click", function() {
    if (navigator.userAgent.match(/Android/i)) {
        // For Android, suggest an external barcode scanner app like "QR & Barcode Scanner"
        alert("Please open your Barcode Scanner app, scan the barcode, and enter the ISBN manually.");
    } else if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
        // For iOS, suggest opening a barcode scanning app.
        alert("Please open your Barcode Scanner app, scan the barcode, and enter the ISBN manually.");
    } else {
        // Suggest the user use a desktop scanner
        alert("Please use an external barcode scanner to scan the code.");
    }
});


