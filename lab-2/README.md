# Lab 2: SQLite database and CRUD routes

**Name:** A.Vedh Sathvik · **Registration number:** <252U1R1004> · **Section:** S-15

**Live link:** https://<your-service-name>.onrender.com

## About
An Express server connected to a SQLite database (`books.db`) that exposes CRUD operations for a `book` table: `book(id, title, author, price, pages)`. All queries use `?` placeholders to prevent SQL injection.

## How to run
1. Clone the repository and open the lab folder:
   ```bash
   cd lab-02
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start          # normal start
   npm run dev        # auto-restart with nodemon
   ```
4. Open http://localhost:3000/books/

**Environment variables:** none required. (`PORT` is optional and defaults to 3000; Render sets it automatically.)

## Endpoints

| Method | Path | Description |
| --- | --- | --- |
| GET | `/` | Health message showing the API is running |
| GET | `/books/` | Get all books |
| GET | `/books/:bookId/` | Get one book by id (404 if not found) |
| POST | `/books/` | Add a new book (201, returns new `bookId`) |
| PUT | `/books/:bookId/` | Update a book (404 if not found) |
| DELETE | `/books/:bookId/` | Delete a book (404 if not found) |

Request body for POST and PUT (JSON):
```json
{ "title": "Zero to One", "author": "Peter Thiel", "price": 380, "pages": 224 }
```

## Screenshots

### SQLite CLI: table and initial rows
![SQLite CLI initial rows](screenshots/01-cli-initial.png)

### GET all books
![GET all books](screenshots/02-get-all.png)

### GET one book
![GET one book](screenshots/03-get-one.png)

### GET book not found (404)
![GET 404](screenshots/04-get-404.png)

### POST add a book (201)
![POST book](screenshots/05-post.png)

### PUT update a book (200)
![PUT book](screenshots/06-put.png)

### DELETE a book (200)
![DELETE book](screenshots/07-delete.png)

### Database check in SQLite CLI after POST, PUT and DELETE
![CLI after changes](screenshots/01-cli-initial.png)

### Live deployment on Render
![Render live](screenshots/09-render-live.png)

## Notes
- **Problem:** `npm run dev` said "Missing script". **Fix:** added the `dev` script to `package.json`.
- **Problem:** `Cannot GET /` in the browser. **Fix:** the routes are under `/books/`, so I opened `/books/` and also added a `/` route.
- **Problem:** `request.body` was empty in POST. **Fix:** used `express.json()` and set Postman Body to raw → JSON.
- **Deployment:** hosted on Render's free plan. The filesystem is ephemeral, so books added on the live site reset to the committed `books.db` after a restart or redeploy. The service also sleeps after inactivity, so the first request can take up to a minute.