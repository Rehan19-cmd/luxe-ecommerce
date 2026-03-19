const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGO_URI || 'mongodb+srv://rehan:rehan@cluster0.p7xve.mongodb.net/luxe?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(uri)
  .then(async () => {
    const Product = require('./models').Product;
    
    // 1. Check raw documents (lean ensures no mongoose hydration/defaults)
    const rawAll = await Product.find({}).lean();
    console.log('RAW DOCUMENTS IN DB:');
    rawAll.forEach(p => console.log(`- ${p.name} | newArrival: ${p.newArrival} | mostSold: ${p.mostSold}`));

    // 2. Perform explicit migration so MongoDB indices have the exact boolean
    console.log('\nMigrating missing fields...');
    const res1 = await Product.updateMany(
      { newArrival: { $exists: false } },
      { $set: { newArrival: false } } // Set old missing ones to false so only explicit NEW stays NEW
    );
    console.log('Migrated newArrival to false where missing:', res1);

    const res2 = await Product.updateMany(
      { mostSold: { $exists: false } },
      { $set: { mostSold: false } }
    );
    console.log('Migrated mostSold to false where missing:', res2);

    // 3. Test the exact filter that express uses
    const filtered = await Product.find({ newArrival: true }).lean();
    console.log('\nQueried {newArrival: true}:', filtered.length);
    filtered.forEach(p => console.log(`- MATCH: ${p.name}`));

    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
