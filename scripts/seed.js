const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { connectDB, disconnectDB } = require('../config/db');

// load env variables
dotenv.config();

// import models to write data to database
const Category = require('../models/Category');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Order = require('../models/Order');

const seedData = async () => {
  try {
    // 1. connect to database
    await connectDB();

    console.log('--- CLEANING DATABASE FIRST ---');
    
    // delete everything to start fresh
    await Category.deleteMany();
    console.log('Categories deleted!');
    
    await Product.deleteMany();
    console.log('Products (Movies) deleted!');
    
    await Cart.deleteMany();
    console.log('Carts deleted!');
    
    await Order.deleteMany();
    console.log('Orders deleted!');
    
    console.log('--- CLEANING DONE --- \n');

    console.log('--- SEEDING ANIME CATEGORIES (GENRES) ---');
    
    const categoriesData = [
      {
        name: 'Action & Shonen',
        description: 'Exciting battles, cool fighting scenes, and epic journeys!'
      },
      {
        name: 'Fantasy & Magic',
        description: 'Mystical worlds, magical creatures, and supernatural powers.'
      },
      {
        name: 'Slice of Life & Drama',
        description: 'Heartwarming stories, daily life, and emotional school dramas.'
      }
    ];

    // save categories to db and get their IDs
    const seededCategories = await Category.insertMany(categoriesData);
    console.log("Seeded " + seededCategories.length + " categories successfully.");
    
    // create a simple map of names to category IDs
    const categoryMap = {};
    seededCategories.forEach((cat) => {
      categoryMap[cat.name] = cat._id;
    });
    console.log('--- ANIME CATEGORIES DONE --- \n');

    console.log('--- SEEDING ANIME MOVIES ---');
    
    const productsData = [
      {
        name: 'Demon Slayer: Mugen Train',
        description: 'Tanjiro and his friends board a train to help Kyojuro Rengoku fight demons.',
        price: 14.99,
        stock: 100, // available tickets/copies
        category: categoryMap['Action & Shonen']
      },
      {
        name: 'Jujutsu Kaisen 0',
        description: 'Yuta Okkotsu joins Jujutsu High after being haunted by his childhood friend.',
        price: 12.99,
        stock: 80,
        category: categoryMap['Action & Shonen']
      },
      {
        name: 'Spirited Away',
        description: 'Chihiro enters a world ruled by gods, witches, and spirits, where her parents turn into pigs.',
        price: 19.99,
        stock: 150,
        category: categoryMap['Fantasy & Magic']
      },
      {
        name: 'Howls Moving Castle',
        description: 'Sophie is cursed by a witch and meets the wizard Howl in his walking castle.',
        price: 17.99,
        stock: 120,
        category: categoryMap['Fantasy & Magic']
      },
      {
        name: 'Your Name',
        description: 'Mitsuha and Taki, two high school strangers, wake up to find they swapped bodies.',
        price: 15.99,
        stock: 200,
        category: categoryMap['Slice of Life & Drama']
      },
      {
        name: 'A Silent Voice',
        description: 'Shoya, a former bully, tries to make amends with Shoko, a deaf girl he bullied in school.',
        price: 11.99,
        stock: 90,
        category: categoryMap['Slice of Life & Drama']
      }
    ];

    // save products (movies) to db
    const seededProducts = await Product.insertMany(productsData);
    console.log("Seeded " + seededProducts.length + " anime movies successfully.");
    console.log('--- ANIME MOVIES DONE --- \n');

    console.log('Database seeding finished!! Everything is ready.');
    
    // disconnect database
    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.log("Error in seeding script: " + error.message);
    await disconnectDB();
    process.exit(1);
  }
};

// run it!
seedData();

