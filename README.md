# E-Commerce REST API - Grade 10 Educational Guide 🚀

Welcome to the **E-Commerce REST API**! This project is a complete, educational backend built with **Node.js**, **Express.js**, and **MongoDB (Mongoose)** using the **MVC (Model-View-Controller)** design pattern.

This guide is designed for 10th-grade programming students. We will explain **every folder, every command, and every key line of code** so you can learn how modern web servers work!

---

## 🏗️ What is MVC? (Model-View-Controller)
MVC is a smart way to organize our project folders so that each part of our code has only **one job**. Think of it like a restaurant:

```
  [CLIENT / USER]  <--->  [ROUTES / CONTROLLER]  <--->  [MODELS]  <--->  [DATABASE]
    (Customer)                 (Waiter)                (Chef)           (Pantry)
```
1.  **Model (The Chef)**: Defines how our data looks. It knows the recipes (schemas) and how to talk to the database (pantry).
2.  **View (The Food)**: The final data sent back to the customer. In a REST API, we send back **JSON data** (text-based data).
3.  **Controller (The Waiter)**: Takes the customer's request (e.g. "I want to buy a laptop"), talks to the Chef (Model) to get the database records, performs calculations (like checking if there is enough stock), and brings the result back to the customer.

---

## 📂 Project Folder Structure
Here is how our code folders are organized:

*   **`config/`**: Holds our database connection settings (`db.js`).
*   **`models/`**: Defines our data structures (schemas for Categories, Products, Carts, and Orders).
*   **`controllers/`**: Contains the business logic of our API (what happens when you add to cart or checkout).
*   **`routes/`**: Connects URL endpoints (like `/api/products`) to the correct controller functions.
*   **`middlewares/`**: Code that runs in between requests (like our Global Error Handler).
*   **`utils/`**: Helper files (`asyncHandler.js` to clean up code, `AppError.js` to create errors).
*   **`scripts/`**: Houses utility scripts like `seed.js` to fill our database with initial sample products.

---

## ⚙️ Prerequisites & Setup Guide

### 1. Requirements
*   **Node.js**: Install Node.js (version 18 or 20). Download it from [nodejs.org](https://nodejs.org/).
*   **Postman**: A free tool to test our API endpoints. Download it from [postman.com](https://www.postman.com/).
*   **MongoDB**: (Optional) MongoDB Server. **Do not worry if you don't have it installed!** Our project is built with an **automatic in-memory fallback**. If it detects your local MongoDB is offline, it will automatically spin up a temporary database in the background!

### 2. Step-by-Step Installation Commands

Open your terminal (PowerShell on Windows, or Terminal on Mac) in the project folder and write these commands:

#### Command A: Install Dependencies
```bash
npm install
```
*   **What this does**: Reads our `package.json` file and downloads all required libraries (`express`, `mongoose`, `dotenv`, etc.) into a folder called `node_modules`.

#### Command B: Seed Initial Data
```bash
npm run seed
```
*   **What this does**: Wipes the database clean and populates it with starter categories (Electronics, Books, Clothing) and products (Gaming Laptop, Wireless Mouse, etc.).
*   *Note*: If your local MongoDB is stopped, this command will print a warning and automatically launch a temporary in-memory database, run the seeding, and shut down cleanly.

#### Command C: Start the Server in Development Mode
```bash
npm run dev
```
*   **What this does**: Launches the server using `nodemon`. Nodemon will monitor your files; if you edit your code and save, the server will restart automatically!

---

## 📝 Environment Variables (`.env`)
Create a file named `.env` in the root folder of the project. This stores settings that can change without modifying our code:

| Variable | Description | Example Value |
| :--- | :--- | :--- |
| `PORT` | The port number our server will listen on. | `5000` |
| `MONGO_URI` | The connection string for your MongoDB database. | `mongodb://127.0.0.1:27017/ecommerce_db` |
| `NODE_ENV` | The environment the server is running in. | `development` or `production` |

---

## 🎯 API Endpoint Documentation
Once your server is running (on `http://localhost:5000`), you can send requests to these endpoints using Postman:

### 1. Categories API (`/api/categories`)
*   `GET /api/categories` : Retrieve all categories.
*   `GET /api/categories/:id` : Retrieve details of a single category by its ID.
*   `POST /api/categories` : Create a new category.
    *   *Body*: `{"name": "Stationery", "description": "Writing items"}`
*   `PUT /api/categories/:id` : Edit a category.
*   `DELETE /api/categories/:id` : Delete a category. **(Safe Check: Fails if products are still in it!)**

### 2. Products API (`/api/products`)
*   `GET /api/products` : Retrieve all products.
    *   *Supports Filters*: `?category=Electronics`, `?minPrice=10&maxPrice=100`, or `?search=laptop`.
*   `GET /api/products/:id` : Retrieve details of a single product **(with full Category details populated!)**.
*   `POST /api/products` : Create a product. **(Validates category exists first!)**
    *   *Body*: `{"name": "Notebook", "price": 4.99, "category": "CATEGORY_ID", "stock": 10, "description": "Paper notepad"}`
*   `PUT /api/products/:id` : Edit product details.
*   `DELETE /api/products/:id` : Delete a product.

### 3. Cart API (`/api/cart`)
*   `GET /api/cart` : View your current shopping cart and total price.
*   `POST /api/cart` : Add an item to your cart. **(Checks stock availability!)**
    *   *Body*: `{"productId": "PRODUCT_ID", "quantity": 3}`
*   `PUT /api/cart/:productId` : Update quantity of a cart item.
    *   *Body*: `{"quantity": 5}`
*   `DELETE /api/cart/:productId` : Remove an item from your cart.
*   `DELETE /api/cart` : Clear your cart.

### 4. Orders API (`/api/orders`)
*   `POST /api/orders` : Checkout your cart!
    *   *Body*: `{"shippingAddress": "123 School Rd"}`
    *   *What it does*: Verifies stock for all cart items, decrements item stock in database, clears your cart, and saves the order.
*   `GET /api/orders` : Retrieve all order history.
*   `GET /api/orders/:id` : Retrieve a specific order by ID.
*   `PUT /api/orders/:id/status` : Update order status (Admin feature).
    *   *Body*: `{"status": "shipped"}` (Allowed: `pending`, `processing`, `shipped`, `delivered`, `cancelled`)

---

## 🔎 Line-by-Line Code Explanations

Here is a breakdown of how the most important blocks of code work in our project:

### 1. Database Automatic Fallback (`config/db.js`)
If a student does not have MongoDB running, standard Mongoose connections will freeze. We fixed this with an automatic in-memory fallback:
```javascript
try {
  // 1. Try to connect to your local database URI
  await mongoose.connect(connURI, {
    serverSelectionTimeoutMS: 2000 // Give up after 2 seconds if DB is offline
  });
} catch (connError) {
  // 2. If it fails, start MongoMemoryServer dynamically!
  const { MongoMemoryServer } = require('mongodb-memory-server');
  mongod = await MongoMemoryServer.create({
    binary: { version: '6.0.14' } // High compatibility version for Windows 10
  });
  connURI = mongod.getUri();
  await mongoose.connect(connURI); // Connect to in-memory DB
}
```
*   **Why this is cool**: You don't need to install database servers locally to run this project. It runs inside your RAM automatically!

### 2. Mongoose ObjectId Relationship (`models/Product.js`)
To link a Product to a Category, we use `ObjectId` references in the schema:
```javascript
category: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Category', // Links this field to the Category model
  required: [true, 'A product must belong to a category.']
}
```
*   **What this does**: Instead of typing the category name inside every product, we store the unique `_id` of the Category document. This is called a **relational reference**.

### 3. Mongoose populate() Mechanism (`controllers/productController.js`)
When we fetch a product, MongoDB only returns the category ID. To get the actual category details, we use `.populate()`:
```javascript
const product = await Product.findById(req.params.id).populate('category');
```
*   **What this does**: Mongoose automatically runs a secondary query behind the scenes to find the Category matching the product's `category` ID, and replaces the ID with the full Category object (name, description, etc.).

### 4. Checkout Stock Verification & Snapshots (`controllers/orderController.js`)
When checking out, we do not want to buy items that are out of stock. We also want to record what price the user paid at that moment in time (in case prices change tomorrow):
```javascript
// 1. Check stock for every item before making changes
for (const item of cart.items) {
  const product = item.product;
  if (product.stock < item.quantity) {
    return next(new AppError(`Insufficient stock for "${product.name}".`, 400));
  }
  // 2. Create a snapshot of the item details (name, price)
  orderItems.push({
    product: product._id,
    name: product.name,
    price: product.price, // Snapshots the price at checkout
    quantity: item.quantity
  });
}

// 3. If all items have enough stock, decrement the stock in the DB
for (const item of cart.items) {
  const product = await Product.findById(item.product._id);
  product.stock -= item.quantity;
  await product.save();
}
```

---

## 📮 How to Test with Postman

1.  **Import the Environment**:
    *   In Postman, click **Import** and select the `postman_environment.json` file.
    *   Select the environment **E-Commerce MVC API Environment** in the top-right corner dropdown.
2.  **Import the Collection**:
    *   Click **Import** and select the `postman_collection.json` file.
    *   This will create a folder containing Categories, Products, Cart, and Orders requests.
3.  **Run in Order**:
    *   Run `GET All Categories` (you will see the seed data).
    *   Run `POST Create Category` (this will automatically save the new category ID to your Postman environment!).
    *   Run `POST Create Product` (which uses the saved `{{categoryId}}` and automatically saves its new ID to `{{productId}}`!).
    *   Run `POST Add Item to Cart` -> `GET View Cart` -> `POST Checkout Order` to complete the e-commerce purchase cycle.
