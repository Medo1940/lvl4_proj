const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { connectDB, disconnectDB } = require('../config/db');

// Load environment variables first
dotenv.config();

// Import our models so we can interact with the database
const Category = require('../models/Category');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Order = require('../models/Order');

const seedData = async () => {
  try {
    // 1. Connect to the database
    await connectDB();

    console.log('--- Database Cleanup Started ---');
    // 2. Clear out any old data to start fresh
    await Category.deleteMany();
    console.log('🗑️  All categories deleted.');
    
    await Product.deleteMany();
    console.log('🗑️  All products deleted.');
    
    await Cart.deleteMany();
    console.log('🗑️  All carts deleted.');
    
    await Order.deleteMany();
    console.log('🗑️  All orders deleted.');
    
    console.log('--- Database Cleanup Completed ---\n');

    console.log('--- Seeding Categories Started ---');
    // 3. Create sample categories
    const categoriesData = [
      {
        name: 'Electronics',
        description: 'Gadgets, devices, and high-tech computing accessories.'
      },
      {
        name: 'Books',
        description: 'Educational, fiction, and non-fiction reading materials.'
      },
      {
        name: 'Clothing',
        description: 'Stylish apparel, comfortable shoes, and accessories.'
      }
    ];

    // Insert categories and store them in a variable so we can access their _ids
    const seededCategories = await Category.insertMany(categoriesData);
    console.log(`✅ Seeded ${seededCategories.length} categories.`);
    
    // Create a map to find categories by name easily
    const categoryMap = {};
    seededCategories.forEach((cat) => {
      categoryMap[cat.name] = cat._id;
    });
    console.log('--- Seeding Categories Completed ---\n');

    console.log('--- Seeding Products Started ---');
    // 4. Create sample products and assign the correct category ObjectId
    const productsData = [
      {
        name: 'Gaming Laptop',
        description: 'High-performance laptop with 16GB RAM and RTX Graphic Card.',
        price: 999.99,
        stock: 10,
        category: categoryMap['Electronics'] // Reference to Electronics Category
      },
      {
        name: 'Wireless Mouse',
        description: 'Ergonomic 2.4GHz wireless mouse with adjustable DPI.',
        price: 24.99,
        stock: 50,
        category: categoryMap['Electronics']
      },
      {
        name: 'Introduction to Algorithms',
        description: 'A comprehensive guide to understanding programming algorithms.',
        price: 59.99,
        stock: 30,
        category: categoryMap['Books'] // Reference to Books Category
      },
      {
        name: 'Sci-Fi Novel',
        description: 'An exciting space odyssey set in the year 3000.',
        price: 12.99,
        stock: 100,
        category: categoryMap['Books']
      },
      {
        name: 'Cotton Hoodie',
        description: 'Super soft, warm fleece hoodie. Perfect for winter.',
        price: 39.99,
        stock: 25,
        category: categoryMap['Clothing'] // Reference to Clothing Category
      },
      {
        name: 'Running Sneakers',
        description: 'Lightweight and breathable sneakers with shock absorption.',
        price: 79.99,
        stock: 15,
        category: categoryMap['Clothing']
      }
    ];

    const seededProducts = await Product.insertMany(productsData);
    console.log(`✅ Seeded ${seededProducts.length} products.`);
    console.log('--- Seeding Products Completed ---\n');

    console.log('🎉 Database seeding completed successfully!');
    // 5. Exit the script successfully
    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error(`💥 Seeding failed with error: ${error.message}`);
    // Exit with failure code (1)
    await disconnectDB();
    process.exit(1);
  }
};

// Execute the seed function
seedData();
