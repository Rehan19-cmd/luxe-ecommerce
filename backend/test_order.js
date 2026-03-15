const axios = require('axios');

async function testOrderSystem() {
  try {
    console.log('--- PHASE 3: FAKE ORDER TEST ---');
    
    // 1. Get a product to order
    console.log('Fetching products...');
    const productsRes = await axios.get('http://localhost:5000/api/products?limit=1');
    const product = productsRes.data.products[0];
    
    if (!product) {
      console.log('No products found to order.');
      return;
    }
    console.log(`Selected product: ${product.name} (Stock: ${product.stock})`);
    const initialStock = product.stock;

    // 2. Create fake order (COD)
    console.log('Creating fake order...');
    const orderData = {
      items: [{
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: 2,
        image: product.images[0] || ''
      }],
      customer: {
        name: 'Test Customer',
        email: 'test@example.com',
        phone: '123-456-7890'
      },
      shippingAddress: {
        street: '123 Fake Street',
        city: 'Cincinnati',
        state: 'OH',
        zip: '45202',
        country: 'US'
      },
      totalAmount: product.price * 2
    };

    const orderRes = await axios.post('http://localhost:5000/api/orders', orderData);
    const orderId = orderRes.data._id;
    console.log(`Order created successfully: ${orderId}`);

    // Wait 1 second
    await new Promise(r => setTimeout(r, 1000));

    // 3. Login as Admin
    console.log('\n--- PHASE 4: CLEANUP & ADMIN TEST ---');
    console.log('Logging in as Admin (Khanfamily2945)...');
    const loginRes = await axios.post('http://localhost:5000/api/login', { password: 'Khanfamily2945' });
    const token = loginRes.data.token;
    console.log('Logged in. Token received.');

    // 4. Verify order in Admin
    console.log('Verifying order shows in admin list...');
    const adminOrdersRes = await axios.get('http://localhost:5000/api/orders', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const foundOrder = adminOrdersRes.data.orders.find(o => o._id === orderId);
    if (foundOrder) {
      console.log(`Verified! Order ${foundOrder.orderNumber} is in admin list.`);
    } else {
      console.log('Error: Order NOT found in admin list.');
    }

    // 5. Delete order via Admin API
    console.log('Deleting test order...');
    const deleteRes = await axios.delete(`http://localhost:5000/api/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`Order deleted: ${deleteRes.data.message}`);

    // 6. Verify stock restored
    const updatedProductRes = await axios.get(`http://localhost:5000/api/products/${product._id}`);
    const restoredStock = updatedProductRes.data.stock;
    console.log(`Stock check: Initial (${initialStock}), Restored (${restoredStock})`);
    
    if (restoredStock === initialStock) {
      console.log('SUCCESS: System works perfectly and state is clean!');
    } else {
      console.log('WARNING: Stock was not restored correctly.');
    }

  } catch (err) {
    console.error('Test failed:', err.response?.data || err.message);
  }
}

testOrderSystem();
