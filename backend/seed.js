require('dotenv').config();
const mongoose = require('mongoose');
const { Product, Category, Seller, Order } = require('./models');

const sellers = [
  { name: 'Aria Luxe', brand: 'Aria', email: 'aria@luxe.com', phone: '+1-555-0101', description: 'Handcrafted luxury diamond jewelry from Italian artisans.', type: 'jewelry' },
  { name: 'Velvet & Gold', brand: 'V&G', email: 'info@velvetgold.com', phone: '+1-555-0202', description: 'Premium gold and platinum bridal collections.', type: 'jewelry' },
  { name: 'Maison Noir', brand: 'Maison Noir', email: 'hello@maisonnoir.com', phone: '+1-555-0303', description: 'Contemporary haute-couture fashion house.', type: 'clothing' },
];

const categories = [
  { name: 'Jewelry', slug: 'jewelry', description: 'Fine jewelry & precious gems' },
  { name: 'Clothing', slug: 'clothing', description: 'Luxury haute couture & designer wear' },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✓ Connected to MongoDB');

  // Clear existing data
  await Promise.all([Product.deleteMany(), Category.deleteMany(), Seller.deleteMany(), Order.deleteMany()]);
  console.log('✓ Cleared existing data');

  // Seed categories
  const cats = await Category.insertMany(categories);
  console.log(`✓ Inserted ${cats.length} categories`);

  // Seed sellers
  const sels = await Seller.insertMany(sellers);
  console.log(`✓ Inserted ${sels.length} sellers`);

  // Seed products
  const products = [
    { name: 'Eternal Diamond Necklace', description: 'A breathtaking 18K white gold necklace featuring a 2.5ct brilliant-cut solitaire diamond, set in a delicate prong setting with a fine chain.', price: 12500, comparePrice: 15000, category: 'jewelry', subcategory: 'Necklaces', tags: ['diamond', 'necklace', 'gold', 'bridal'], images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800'], seller: sels[0]._id, stock: 8, featured: true, trending: true, rating: 4.9, reviewCount: 124, material: '18K White Gold, Diamond', weight: '15g' },
    { name: 'Royal Sapphire Ring', description: 'An exquisite platinum ring featuring a 3ct oval Ceylon sapphire surrounded by a halo of micro-pavé diamonds.', price: 8900, comparePrice: 11000, category: 'jewelry', subcategory: 'Rings', tags: ['sapphire', 'ring', 'platinum', 'engagement'], images: ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800'], seller: sels[0]._id, stock: 5, featured: true, rating: 4.8, reviewCount: 89, material: 'Platinum, Sapphire, Diamonds', weight: '8g' },
    { name: 'Golden Cascade Earrings', description: 'Stunning 22K gold chandelier earrings with intricate filigree work and sparkling white topaz accents.', price: 4200, comparePrice: 5500, category: 'jewelry', subcategory: 'Earrings', tags: ['gold', 'earrings', 'chandelier'], images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800'], seller: sels[1]._id, stock: 12, featured: true, trending: true, rating: 4.7, reviewCount: 67, material: '22K Gold, White Topaz', weight: '12g' },
    { name: 'Pearl Infinity Bracelet', description: 'An elegant bracelet featuring lustrous Akoya pearls linked with 18K rose gold infinity symbols.', price: 3800, category: 'jewelry', subcategory: 'Bracelets', tags: ['pearl', 'bracelet', 'rose-gold'], images: ['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800'], seller: sels[1]._id, stock: 15, trending: true, rating: 4.6, reviewCount: 43, material: '18K Rose Gold, Akoya Pearls', weight: '20g' },
    { name: 'Emerald Essence Pendant', description: 'A captivating pendant showcasing a rare 1.8ct Colombian emerald set in 18K yellow gold with diamond accents.', price: 6700, comparePrice: 7500, category: 'jewelry', subcategory: 'Pendants', tags: ['emerald', 'pendant', 'gold'], images: ['https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=800'], seller: sels[0]._id, stock: 6, rating: 4.5, reviewCount: 31, material: '18K Yellow Gold, Emerald, Diamonds', weight: '10g' },
    { name: 'Midnight Velvet Gown', description: 'A floor-length silk velvet gown in deep midnight black with hand-embroidered gold thread detailing along the bodice.', price: 2800, comparePrice: 3500, category: 'clothing', subcategory: 'Gowns', tags: ['gown', 'velvet', 'evening'], images: ['https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800'], seller: sels[2]._id, stock: 10, featured: true, trending: true, rating: 4.8, reviewCount: 56, material: 'Silk Velvet, Gold Thread' },
    { name: 'Ivory Silk Bridal Set', description: 'An exquisite bridal ensemble featuring a hand-draped ivory silk lehenga with Swarovski crystal embellishments.', price: 5500, category: 'clothing', subcategory: 'Bridal', tags: ['bridal', 'silk', 'lehenga', 'wedding'], images: ['https://images.unsplash.com/photo-1594463750939-ebb28c3f7f75?w=800'], seller: sels[2]._id, stock: 4, featured: true, rating: 4.9, reviewCount: 78, material: 'Pure Silk, Swarovski Crystals' },
    { name: 'Gold Embroidered Blazer', description: 'A tailored black blazer with intricate gold zardozi embroidery — perfect for luxury evening occasions.', price: 1800, comparePrice: 2200, category: 'clothing', subcategory: 'Blazers', tags: ['blazer', 'embroidered', 'evening'], images: ['https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800'], seller: sels[2]._id, stock: 18, trending: true, rating: 4.6, reviewCount: 34, material: 'Wool Blend, Gold Thread' },
  ];

  const prods = await Product.insertMany(products);
  console.log(`✓ Inserted ${prods.length} products`);

  // Seed a few sample orders
  const orders = [
    { items: [{ product: prods[0]._id, name: prods[0].name, price: prods[0].price, quantity: 1, image: prods[0].images[0] }], customer: { name: 'Sophia Laurent', email: 'sophia@example.com', phone: '+1-555-1001', address: '123 Fifth Avenue, New York' }, totalAmount: 12500, status: 'delivered', paymentStatus: 'paid' },
    { items: [{ product: prods[5]._id, name: prods[5].name, price: prods[5].price, quantity: 1, image: prods[5].images[0] }, { product: prods[7]._id, name: prods[7].name, price: prods[7].price, quantity: 1, image: prods[7].images[0] }], customer: { name: 'James Morgan', email: 'james@example.com', phone: '+1-555-1002', address: '88 Rodeo Drive, Beverly Hills' }, totalAmount: 4600, status: 'shipped', paymentStatus: 'paid' },
    { items: [{ product: prods[2]._id, name: prods[2].name, price: prods[2].price, quantity: 2, image: prods[2].images[0] }], customer: { name: 'Elena Rossi', email: 'elena@example.com', phone: '+1-555-1003', address: '45 Via Condotti, Rome' }, totalAmount: 8400, status: 'pending', paymentStatus: 'unpaid' },
  ];

  const ords = await Order.insertMany(orders);
  console.log(`✓ Inserted ${ords.length} orders`);

  console.log('\n🎉 Seed complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
