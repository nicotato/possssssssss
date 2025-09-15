// Estrategias de migración para el esquema de usuario
export const userMigrationStrategies = {
  1: function(oldDoc: any) {
    // Migración de versión 0 a versión 1
    // Agregar los nuevos campos con valores por defecto
    return {
      ...oldDoc,
      mustChangePassword: false,
      passwordChangedAt: oldDoc.createdAt || new Date().toISOString()
    };
  }
};
