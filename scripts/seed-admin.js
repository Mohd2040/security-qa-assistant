/**
 * Seed Admin User Script
 * 
 * This script creates the first admin user in the database.
 * Run with: node scripts/seed-admin.js
 */

require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function seedAdmin() {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
        console.error('❌ MONGODB_URI not found in environment variables');
        process.exit(1);
    }

    console.log('🔐 Admin User Seed Script\n');

    const name = await question('Enter admin name: ');
    const email = await question('Enter admin email: ');
    const password = await question('Enter admin password: ');

    if (!name || !email || !password) {
        console.error('❌ All fields are required!');
        rl.close();
        process.exit(1);
    }

    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('\n✅ Connected to MongoDB');

        const db = client.db();
        const usersCollection = db.collection('users');

        // Check if admin already exists
        const existingUser = await usersCollection.findOne({ email });
        if (existingUser) {
            console.log(`⚠️  User with email "${email}" already exists!`);
            rl.close();
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create admin user
        const adminUser = {
            name,
            email,
            password: hashedPassword,
            role: 'admin',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await usersCollection.insertOne(adminUser);

        console.log(`\n✅ Admin user created successfully!`);
        console.log(`   Name: ${name}`);
        console.log(`   Email: ${email}`);
        console.log(`   Role: admin`);
        console.log(`   ID: ${result.insertedId}`);
        console.log(`\nYou can now log in at /login\n`);

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.close();
        rl.close();
    }
}

seedAdmin();
