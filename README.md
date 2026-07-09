# First Term Project - E-Commerce Backend — Products, Categories, Cart & Orders

Welcome to the **First Term Project E-Commerce Backend API**. This project is a complete server-side application built with **Node.js**, **Express.js**, and **MongoDB (Mongoose)** using the **MVC (Model-View-Controller)** structure.

Project repository: https://github.com/Medo1940/lvl4_proj.git

This guide explains the project structure, how to run the application, and the available API endpoints.

---

## 🏗️ What is MVC? (Model-View-Controller)
MVC is a neat way to organize our project folders so that each part of our code has only **one job**:

1. **Model**: Defines how our database tables (collections) look. It defines the schemas (blueprints) for Genres, Movies, Carts, and Orders.
2. **View**: The response data we send back to the user. In our API, we return **JSON data** (text-based format).
3. **Controller**: Contains the main coding logic. It handles what happens when you fetch movies, search, add a ticket to the cart, or checkout.

---

## 📂 Project Folders
Here is how our project is organized:

* **`config/`**: Contains database settings and the connection file (`db.js`).
* **`models/`**: Defines our data structures (schemas for Categories, Products, Carts, and Orders).
* **`controllers/`**: Contains the code logic of our API (handling movie searches, cart additions, or checkouts).
* **`routes/`**: Links URL endpoints (like `/api/products`) to the correct controller functions.
* **`middlewares/`**: Code that runs in the middle of a request (like printing logs or catching errors).
* **`utils/`**: Helper files (like custom error creators and clean async wrappers).
* **`scripts/`**: Contains `seed.js` which fills our database with sample anime categories and movies!

---

## ⚙️ How to Setup and Run the App

### 1. Requirements
* **Node.js**: Download and install it from [nodejs.org](https://nodejs.org/).
* **Postman**: Download and install it from [postman.com](https://www.postman.com/) to send API requests.
* **MongoDB**: (Optional) If you don't have it installed, don't worry! Our app will automatically start a temporary in-memory database in your computer RAM if it can't find a local MongoDB server.

### 2. Steps to Run
Open your terminal (PowerShell on Windows) inside the project folder and run these:

#### Step A: Install Packages
```bash
npm install
```
* Installs all the libraries (`express`, `mongoose`, `dotenv`, etc.) listed in `package.json` into a folder called `node_modules`.

#### Step B: Seed Initial Anime Movies
```bash
npm run seed
```
* Wipes database clean and seeds sample categories (Action & Shonen, Fantasy & Magic, Slice of Life & Drama) and movies (*Demon Slayer*, *Spirited Away*, *Your Name*, etc.).

#### Step C: Run the App
```bash
npm run dev
```
* Runs the server on port `5000` using `nodemon`, so it will automatically restart every time you edit your code files!

---

## 📝 Environment Variables (`.env`)
Create a file named `.env` in the root folder of the project to set settings:

* `PORT`: The port number our server runs on (e.g. `5000`).
* `MONGO_URI`: The connection string for your MongoDB database (e.g. `mongodb://127.0.0.1:27017/anime_movies_db`).
* `NODE_ENV`: Set to `development` or `production`.

---

## 🎯 API Endpoint Documentation

### 1. Categories / Genres API (`/api/categories`)
* `GET /api/categories` : Get all anime genres.
* `GET /api/categories/:id` : Get single genre details.
* `POST /api/categories` : Add a new genre.
  * *Body*: `{"name": "Horror & Mystery", "description": "Spooky anime movies"}`
* `PUT /api/categories/:id` : Edit genre details.
* `DELETE /api/categories/:id` : Delete a genre (fails if movies are still linked to it).

### 2. Anime Movies API (`/api/products`)
* `GET /api/products` : Get all anime movies.
  * *Filters*: `?category=Fantasy`, `?minPrice=10&maxPrice=15`, or `?search=Name`.
* `GET /api/products/:id` : Get details of a single anime movie with its genre populated.
* `POST /api/products` : Add a new anime movie.
  * *Body*: `{"name": "Weathering With You", "description": "A high-school boy meets a girl who can control weather.", "price": 13.99, "category": "GENRE_ID", "stock": 50}`
* `PUT /api/products/:id` : Edit movie details.
* `DELETE /api/products/:id` : Delete a movie from database.

### 3. Shopping Cart API (`/api/cart`)
* `GET /api/cart` : View your ticket cart and total price.
* `POST /api/cart` : Add movie tickets to your cart (validates movie stock first).
  * *Body*: `{"productId": "MOVIE_ID", "quantity": 2}`
* `PUT /api/cart/:productId` : Update quantity of tickets in cart.
  * *Body*: `{"quantity": 4}`
* `DELETE /api/cart/:productId` : Remove movie tickets from cart.
* `DELETE /api/cart` : Empty the cart.

### 4. Ticket Orders API (`/api/orders`)
* `POST /api/orders` : Checkout the cart to purchase tickets!
  * *Body*: `{"shippingAddress": "user_email@gmail.com"}` (We use email to deliver tickets).
  * Decrements the seat stock of movies in the database and clears the cart.
* `GET /api/orders` : Retrieve order history.
* `GET /api/orders/:id` : Get specific order details.
* `PUT /api/orders/:id/status` : Change order status (e.g. from `pending` to `delivered`).
  * *Body*: `{"status": "delivered"}`

---

## 📮 Testing with Postman
1. Open Postman.
2. Import the environment file `postman_environment.json` and select **Anime Movie Ticket MVC API Environment** in the top right.
3. Import the collection file `postman_collection.json`.
4. Run requests in order: GET Categories -> POST Create Category -> POST Create Product -> POST Add Item to Cart -> POST Checkout Order.
