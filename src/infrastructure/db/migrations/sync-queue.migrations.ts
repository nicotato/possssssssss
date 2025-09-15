// Migration 0 -> 1: rename field 'collection' to 'entityCollection'
export const syncQueueMigrationStrategies: Record<number, (oldDoc: any) => any> = {
  1: (oldDoc: any) => {
    if (oldDoc.collection && !oldDoc.entityCollection) {
      oldDoc.entityCollection = oldDoc.collection;
      delete oldDoc.collection;
    }
    return oldDoc;
  }
};
