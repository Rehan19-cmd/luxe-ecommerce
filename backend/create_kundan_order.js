const mongoose = require('mongoose');
const { Product, Order, Seller, Category } = require('./models');
require('dotenv').config();

async function createGoldKundanOrder() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const product = await Product.findOne({ name: 'Gold Kundan Necklace Set' });
    if (!product) {
      console.log('Could not find Gold Kundan Necklace Set');
      process.exit(1);
    }

    const order = new Order({
      items: [{
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.images[0] || ''
      }],
      customer: {
        name: 'Jane Smith (Test)',
        email: 'jane@example.com',
        phone: '987-654-3210'
      },
      shippingAddress: {
        street: '456 Luxury Ave',
        city: 'Cincinnati',
        state: 'OH',
        zip: '45202',
        country: 'US'
      },
      totalAmount: product.price,
      paymentMethod: 'stripe',
      paymentStatus: 'paid', // Simulate successful Stripe payment
      status: 'confirmed'
    });

    await order.save();
    console.log(`Successfully created test order for ${product.name}! Order Number: ${order.orderNumber}`);

    // If Sellers or Categories are empty, let's insert some dummies so the dashboard looks good.
    const sellerCount = await Seller.countDocuments();
    if (sellerCount === 0) {
      await Seller.create({ name: 'Luxe Official', brand: 'LUXE', email: 'contact@luxe.com', type: 'both' });
      console.log('Created missing Seller profile');
    }

    const categoryCount = await Category.countDocuments();
    if (categoryCount === 0) {
      await Category.create([
        { name: 'Jewelry', slug: 'jewelry' },
        { name: 'Clothing', slug: 'clothing' }
      ]);
      console.log('Created missing Categories');
    }

    // Assign seller to product if missing
    const seller = await Seller.findOne();
    if (!product.seller && seller) {
      product.seller = seller._id;
      await product.save();
    }

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

createGoldKundanOrder();
