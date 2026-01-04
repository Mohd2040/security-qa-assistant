/**
 * Verify Admin User Script
 * 
 * This script checks if the admin user exists and shows the stored password hash
 * Run with: node scripts/verify-admin.js
 */

require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function verifyAdmin() {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
        console.error('❌ MONGODB_URI not found in environment variables');
        process.exit(1);
    }

    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('✅ Connected to MongoDB\n');

        const db = client.db();
        const usersCollection = db.collection('users');

        // Find admin user
        const admin = await usersCollection.findOne({ email: 'mabushallouf@masterteam.sa' });

        if (!admin) {
            console.log('❌ Admin user not found!');
            return;
        }

        console.log('✅ Admin user found:');
        console.log(`   ID: ${admin._id}`);
        console.log(`   Name: ${admin.name}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Role: ${admin.role}`);
        console.log(`   Has Password: ${admin.password ? 'Yes' : 'No'}`);
        console.log(`   Password Hash (first 20 chars): ${admin.password?.substring(0, 20)}...`);
        console.log(`   Created At: ${admin.createdAt}`);

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.close();
    }
}

verifyAdmin();
