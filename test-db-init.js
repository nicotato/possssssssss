// Script de diagnóstico para probar la inicialización de la base de datos
console.log('Iniciando test de base de datos...');

try {
  // Importar directamente el módulo de inicialización
  import('./src/infrastructure/db/init-database.ts').then(async ({ initDatabaseV7 }) => {
    console.log('Módulo importado exitosamente');
    
    try {
      const db = await initDatabaseV7();
      console.log('Base de datos inicializada exitosamente!');
      console.log('Colecciones disponibles:', Object.keys(db.collections));
      
      // Probar una operación simple
      const products = await db.products.find().exec();
      console.log('Productos encontrados:', products.length);
      
    } catch (dbError) {
      console.error('Error inicializando base de datos:', dbError);
      console.error('Stack:', dbError.stack);
    }
  }).catch(importError => {
    console.error('Error importando módulo de base de datos:', importError);
    console.error('Stack:', importError.stack);
  });
} catch (error) {
  console.error('Error general:', error);
  console.error('Stack:', error.stack);
}
