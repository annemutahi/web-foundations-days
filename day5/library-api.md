# Library Books API

Base path: `/books`

## List Books

- Method: `GET`
- Path: `/books`
- Description: List all books in the library.
- Success status: `200 OK`

## Get One Book

- Method: `GET`
- Path: `/books/{bookId}`
- Description: Get a book by its ID.
- Success status: `200 OK`

## Create a Book

- Method: `POST`
- Path: `/books`
- Description: Add a new book to the library.
- Example request body:

	```json
	{
		"title": "The Hobbit",
		"author": "J.R.R. Tolkien",
		"publishedYear": 1937
	}
	```

- Success status: `201 Created`

## Update a Book

- Method: `PUT`
- Path: `/books/{bookId}`
- Description: Replace a book's details.
- Example request body:

	```json
	{
		"title": "The Hobbit",
		"author": "J.R.R. Tolkien",
		"publishedYear": 1937
	}
	```

- Success status: `200 OK`

## Delete a Book

- Method: `DELETE`
- Path: `/books/{bookId}`
- Description: Delete a book by its ID.
- Success status: `204 No Content`

## List Books by Author

- Method: `GET`
- Path: `/books?author={authorName}`
- Description: List books written by the author in the `author` query parameter.
- Success status: `200 OK`

## Error Responses

- `400 Bad Request`: The request body is missing a required field, such as `title` when creating a book.
- `404 Not Found`: The requested book ID does not exist, such as `GET /books/9999`.