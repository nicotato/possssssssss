export const DEFAULT_ROLES = [
  {
    id: 'r_owner',
    name: 'OWNER',
    description: 'Dueño / visión estratégica',
    permissions: ['*'] // todos
  },
  {
    id: 'r_admin',
    name: 'ADMIN',
    description: 'Control total operativo',
    permissions: ['*']
  },
  {
    id: 'r_cajero',
    name: 'CAJERO',
    description: 'Opera caja',
    permissions: [
      'PRODUCT_VIEW','SALE_CREATE','INVOICE_PRINT','KITCHEN_PRINT','SALE_VIEW',
      'CUSTOMER_VIEW','CUSTOMER_EDIT','TIP_CONFIG'
    ]
  },
  {
    id: 'r_supervisor',
    name: 'SUPERVISOR',
    description: 'Supervisa y controla',
    permissions: [
      'PRODUCT_VIEW','SALE_VIEW','SALE_CANCEL','INVOICE_PRINT',
      'KITCHEN_PRINT','REPORT_VIEW','SALE_FULFILL','CUSTOMER_VIEW'
    ]
  },
  {
    id: 'r_visor',
    name: 'VISOR',
    description: 'Solo consulta',
    permissions: ['PRODUCT_VIEW','SALE_VIEW','REPORT_VIEW','CUSTOMER_VIEW']
  }
];