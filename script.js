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
    const scanner = document.getElementById("scanner");
    scanner.style.display = "block";  // Ensure the video element is visible

    // Make sure the video element is correctly initialized and attached to the DOM
    const videoElement = document.getElementById('scanner');
    if (videoElement) {
        console.log("Video element found!");
    } else {
        console.error("Video element not found!");
    }

    // Initialize Quagga.js
    Quagga.init({
        inputStream: {
            name: "Live",
            type: "LiveStream",
            target: videoElement,  // Attach to the <video> element
            constraints: {
                facingMode: "environment"  // Use the rear camera on mobile devices
            }
        },
        decoder: {
            readers: ["ean_reader"]  // EAN-13 format (common for ISBN barcodes)
        }
    }, function(err) {
        if (err) {
            console.error("Quagga initialization error:", err);
            alert("Error initializing scanner. Please ensure camera permissions are granted.");
            return;
        }

        // Log to confirm initialization success
        console.log("Quagga initialized successfully!");
        Quagga.start();  // Start the scanner
    });

    // Handle barcode detection
    Quagga.onDetected(function(result) {
        const isbn = result.codeResult.code;
        document.getElementById("isbn").value = isbn;  // Set the ISBN value
        Quagga.stop();  // Stop the scanner once a barcode is detected
        scanner.style.display = "none";  // Hide the video stream
    });
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
