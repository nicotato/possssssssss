// Minimal module declarations for RxDB plugin deep imports to satisfy TS under NodeNext.
// Use RxPlugin type so addRxPlugin() accepts them without casting.
// Use any for plugin types to avoid resolution issues if internal RxDB types shift.
declare module 'rxdb/plugins/migration' { export const RxDBMigrationPlugin: any; }
declare module 'rxdb/plugins/update' { export const RxDBUpdatePlugin: any; }
declare module 'rxdb/plugins/query-builder' { export const RxDBQueryBuilderPlugin: any; }
