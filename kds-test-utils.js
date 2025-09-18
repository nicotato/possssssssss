/**
 * Script para crear órdenes de prueba con estado de cocina
 * Ejecutar en la consola del navegador para probar el KDS
 */

// Función para generar ID único
function generateId() {
  return 'order_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Productos de ejemplo
const sampleProducts = [
  { id: 'pizza-margherita', name: 'Pizza Margherita', price: 1200 },
  { id: 'pizza-pepperoni', name: 'Pizza Pepperoni', price: 1400 },
  { id: 'hamburguesa-clasica', name: 'Hamburguesa Clásica', price: 800 },
  { id: 'papas-fritas', name: 'Papas Fritas', price: 400 },
  { id: 'coca-cola', name: 'Coca Cola', price: 300 },
  { id: 'agua-mineral', name: 'Agua Mineral', price: 200 }
];

// Nombres de clientes de ejemplo
const sampleCustomers = [
  'Juan Pérez', 'María García', 'Carlos López', 'Ana Martín', 'Luis González',
  'Carmen Ruiz', 'Pablo Sánchez', 'Sofia Díaz', 'Miguel Torres', 'Elena Vargas'
];

// Función para crear una orden de muestra
window.createSampleKitchenOrder = function(kitchenStatus = 'pending', minutesAgo = 0) {
  const orderId = generateId();
  const createdAt = new Date(Date.now() - (minutesAgo * 60 * 1000)).toISOString();
  const customerName = sampleCustomers[Math.floor(Math.random() * sampleCustomers.length)];
  
  // Generar líneas de productos aleatorias
  const numItems = Math.floor(Math.random() * 4) + 1; // 1-4 items
  const lines = [];
  let total = 0;
  
  for (let i = 0; i < numItems; i++) {
    const product = sampleProducts[Math.floor(Math.random() * sampleProducts.length)];
    const qty = Math.floor(Math.random() * 3) + 1; // 1-3 quantity
    const lineTotal = product.price * qty;
    
    lines.push({
      productId: product.id,
      name: product.name,
      qty: qty,
      unitPrice: product.price,
      lineTotal: lineTotal
    });
    
    total += lineTotal;
  }
  
  return {
    id: orderId,
    createdAt: createdAt,
    status: 'paid',
    kitchenStatus: kitchenStatus,
    customerName: customerName,
    customerPhone: '555-0' + Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
    lines: lines,
    total: total,
    discounts: [],
    payments: [{ method: 'efectivo', amount: total }],
    taxLines: [],
    taxTotal: 0
  };
};

// Función para crear múltiples órdenes de prueba
window.createSampleKitchenOrders = function() {
  const orders = [
    // Órdenes pendientes (algunas urgentes)
    createSampleKitchenOrder('pending', 2),   // 2 minutos atrás
    createSampleKitchenOrder('pending', 8),   // 8 minutos atrás  
    createSampleKitchenOrder('pending', 12),  // 12 minutos atrás (warning)
    createSampleKitchenOrder('pending', 18),  // 18 minutos atrás (urgent)
    
    // Órdenes en progreso
    createSampleKitchenOrder('in_progress', 5),  // 5 minutos atrás
    createSampleKitchenOrder('in_progress', 15), // 15 minutos atrás
    createSampleKitchenOrder('in_progress', 25), // 25 minutos atrás (warning)
    createSampleKitchenOrder('in_progress', 35), // 35 minutos atrás (urgent)
  ];
  
  return orders;
};

// Función para simular insertar órdenes en la base de datos
// NOTA: Esta función requiere acceso a los servicios de la app
window.insertSampleOrders = async function() {
  console.log('🍕 Creating sample kitchen orders...');
  
  try {
    // Verificar que tenemos acceso a los servicios
    if (!window.app?.services?.orders) {
      console.error('❌ App services not available. Make sure you are logged in.');
      return;
    }
    
    const orders = createSampleKitchenOrders();
    console.log(`📦 Generated ${orders.length} sample orders`);
    
    // Insertar cada orden en la base de datos
    for (const order of orders) {
      try {
        // Usar la inserción directa en el repository
        await window.app.services.orders.orderRepository.col.insert(order);
        console.log(`✅ Inserted order: ${order.id} (${order.kitchenStatus})`);
      } catch (error) {
        console.error(`❌ Failed to insert order ${order.id}:`, error);
      }
    }
    
    console.log('🎉 Sample orders created! Check the KDS page.');
    
  } catch (error) {
    console.error('❌ Failed to create sample orders:', error);
  }
};

// Función para limpiar órdenes de prueba
window.cleanSampleOrders = async function() {
  console.log('🧹 Cleaning sample orders...');
  
  try {
    if (!window.app?.services?.orders) {
      console.error('❌ App services not available.');
      return;
    }
    
    // Eliminar órdenes que empiecen con 'order_'
    const allOrders = await window.app.services.orders.orderRepository.col.find().exec();
    const sampleOrders = allOrders.filter(order => order.id.startsWith('order_'));
    
    console.log(`🗑️ Found ${sampleOrders.length} sample orders to remove`);
    
    for (const order of sampleOrders) {
      await order.remove();
      console.log(`🗑️ Removed: ${order.id}`);
    }
    
    console.log('✅ Sample orders cleaned!');
    
  } catch (error) {
    console.error('❌ Failed to clean sample orders:', error);
  }
};

console.log(`
🍳 KDS Test Utilities Loaded!

Available functions:
- createSampleKitchenOrder(status, minutesAgo) - Create a single sample order
- createSampleKitchenOrders() - Create array of sample orders  
- insertSampleOrders() - Insert sample orders into database
- cleanSampleOrders() - Remove all sample orders

Usage:
1. Make sure you are logged in to the app
2. Run: insertSampleOrders()
3. Go to KDS page to see the orders
4. Run: cleanSampleOrders() to clean up
`);

export { createSampleKitchenOrder, createSampleKitchenOrders };