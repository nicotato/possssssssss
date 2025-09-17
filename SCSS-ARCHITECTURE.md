# SCSS Modular Architecture - POS System

## Overview
Comprehensive modular SCSS architecture following ITCSS (Inverted Triangle CSS) methodology for maintainability, scalability, and component reusability. This replaces the monolithic CSS approach with a professional component-based system.

## Architecture Structure

```
src/styles/
├── main.scss                 # Main entry point 
├── base/                     # Foundation layer
│   ├── _variables.scss       # Design system variables
│   ├── _mixins.scss         # Utility mixins and functions
│   └── _reset.scss          # Modern CSS reset
├── layouts/                  # Layout components
│   ├── _grid.scss           # CSS Grid + Flexbox system
│   ├── _header.scss         # Header component styles
│   ├── _sidebar.scss        # Sidebar navigation styles
│   └── _main.scss           # Main content area styles
├── components/              # UI components
│   ├── _buttons.scss        # Button system with variants
│   ├── _forms.scss          # Form components with validation
│   ├── _cards.scss          # Card system with POS variants
│   ├── _modals.scss         # Modal system with animations
│   ├── _tables.scss         # Table system with responsive behavior
│   ├── _alerts.scss         # Alert and notification system
│   └── _navigation.scss     # Navigation components
└── utils/                   # Utility classes
    └── _utilities.scss      # Complete utility class system
```

## Design System Foundation

### Variables (`_variables.scss`)
- **Colors**: Primary/secondary palette with semantic meaning
- **Typography**: Font families, sizes, weights, line heights
- **Spacing**: Consistent spacing scale (xs to 3xl)
- **Borders**: Radius and width standards
- **Shadows**: Elevation system
- **Z-index**: Layering system
- **Transitions**: Animation timing standards

### Key Design Tokens:
```scss
// Colors
--color-primary: #2563eb;
--color-success: #10b981;
--color-danger: #ef4444;
--color-warning: #f59e0b;

// Spacing scale
--spacing-xs: 0.25rem;    // 4px
--spacing-sm: 0.5rem;     // 8px
--spacing-md: 1rem;       // 16px
--spacing-lg: 1.5rem;     // 24px
--spacing-xl: 2rem;       // 32px

// Typography
--font-size-sm: 0.875rem;
--font-size-base: 1rem;
--font-size-lg: 1.125rem;
```

## Component System

### Button System (`_buttons.scss`)
- **Variants**: Primary, secondary, success, danger, warning, info
- **Sizes**: Small, base, large
- **States**: Default, hover, active, disabled, loading
- **Special**: Icon buttons, button groups, floating action buttons

### Form System (`_forms.scss`)
- **Controls**: Text inputs, selects, textareas, checkboxes, radios
- **Validation**: Error states, success states, helper text
- **Layout**: Form groups, inline forms, grid layouts
- **Components**: Input groups, floating labels, file uploads

### Card System (`_cards.scss`)
- **Base**: Standard card with header, body, footer
- **POS Variants**: Product cards, order cards, dashboard cards
- **States**: Default, hover, selected, loading
- **Layout**: Card grids, responsive behavior

### Modal System (`_modals.scss`)
- **Sizes**: Small, default, large, extra-large, fullscreen
- **Animations**: Fade in/out, slide animations
- **Types**: Standard, confirm dialogs, POS-specific modals
- **Features**: Backdrop, close buttons, scrollable content

### Table System (`_tables.scss`)
- **Base**: Standard table styling with borders and spacing
- **Features**: Sorting, pagination, hover states
- **Responsive**: Mobile card layout fallback
- **POS Variants**: Order tables, product tables, compact tables

### Alert System (`_alerts.scss`)
- **Types**: Success, danger, warning, info notifications
- **Variants**: Standard, solid, outline styles
- **Features**: Dismissible, auto-dismiss, progress bars
- **Toast**: Positioned notifications with animations
- **POS Specific**: Connection alerts, error alerts

### Navigation System (`_navigation.scss`)
- **Navbar**: Main navigation with brand, links, responsive toggle
- **Sidebar**: Collapsible side navigation with sections
- **Tabs**: Tab navigation with active states
- **Breadcrumbs**: Navigation hierarchy
- **Pagination**: Data pagination with responsive behavior

## Utility System (`_utilities.scss`)

### Comprehensive Utility Classes:
- **Spacing**: Margin and padding utilities (responsive)
- **Display**: Block, flex, grid, none utilities
- **Flexbox**: Direction, wrap, justify, align utilities
- **Grid**: Template columns, span, gap utilities
- **Typography**: Text align, size, weight, transform
- **Colors**: Text and background color utilities
- **Borders**: Border utilities with colors and radius
- **Position**: Static, relative, absolute, fixed, sticky
- **Sizing**: Width, height, viewport utilities
- **Misc**: Opacity, shadows, overflow, z-index

### Responsive Utilities:
All spacing, display, and layout utilities include responsive variants:
```scss
.d-md-flex        // Display flex on medium screens and up
.justify-lg-center // Justify center on large screens and up
.p-sm-3           // Padding level 3 on small screens and up
```

## Usage Guidelines

### Component Import Order (main.scss):
```scss
// 1. Base layer
@import 'base/variables';
@import 'base/mixins';
@import 'base/reset';

// 2. Layout layer
@import 'layouts/grid';
@import 'layouts/header';
@import 'layouts/sidebar';
@import 'layouts/main';

// 3. Component layer
@import 'components/buttons';
@import 'components/forms';
// ... other components

// 4. Utility layer
@import 'utils/utilities';
```

### Naming Conventions:
- **BEM Methodology**: `.component__element--modifier`
- **Utility Prefixes**: `.d-`, `.p-`, `.m-`, `.text-`, `.bg-`
- **State Classes**: `.active`, `.disabled`, `.loading`
- **Responsive**: `.d-md-flex`, `.p-lg-4`

### Component Usage Examples:

#### Button with Icon:
```html
<button class="btn btn-primary btn-lg">
  <i class="btn__icon">📄</i>
  Generate Report
</button>
```

#### Responsive Card Grid:
```html
<div class="grid grid-cols-1 grid-md-cols-2 grid-lg-cols-3 gap-4">
  <div class="card card-product">
    <div class="card__header">Product Name</div>
    <div class="card__body">Content...</div>
  </div>
</div>
```

#### Form with Validation:
```html
<div class="form-group">
  <label class="form-label required">Email</label>
  <input type="email" class="form-control is-invalid">
  <div class="form-feedback">Please provide a valid email</div>
</div>
```

## POS-Specific Components

### Status Indicators:
```scss
.status-online   // Green online indicator
.status-offline  // Red offline indicator  
.status-pending  // Yellow pending indicator
```

### Currency Display:
```scss
.currency        // Monospace font for amounts
.currency-large  // Large currency display
```

### Connection Alerts:
```scss
.connection-alert.offline  // Red offline alert
.connection-alert.syncing  // Yellow syncing alert
.connection-alert.online   // Green online alert
```

## Integration with Vite

### Configuration (`vite.config.ts`):
```typescript
css: {
  preprocessorOptions: {
    scss: {
      additionalData: `
        @import "@styles/base/variables";
        @import "@styles/base/mixins";
      `,
      api: 'modern-compiler'
    }
  }
}
```

### Alias Setup:
```typescript
alias: {
  '@styles': path.resolve(__dirname, 'src/styles')
}
```

## Migration Strategy

### Phase 1: Foundation (✅ COMPLETED)
- Create base variables and mixins
- Implement reset and typography
- Set up main.scss entry point

### Phase 2: Layout System (✅ COMPLETED)  
- Grid system implementation
- Header, sidebar, main layout components
- Responsive breakpoint system

### Phase 3: Component Library (✅ COMPLETED)
- Button, form, card components
- Modal, table, alert systems
- Navigation components

### Phase 4: Utility Classes (✅ COMPLETED)
- Spacing, display, flexbox utilities
- Typography, color, border utilities
- Responsive variants

### Phase 5: Integration (🔄 IN PROGRESS)
- Update main.js to import new SCSS
- Replace style.css with modular system
- Test component rendering

## Maintenance Guidelines

### Adding New Components:
1. Create new file in `components/` directory
2. Follow BEM naming convention
3. Include responsive behavior
4. Add POS-specific variants if needed
5. Import in main.scss
6. Document usage patterns

### Modifying Design System:
1. Update variables in `_variables.scss`
2. Test impact across all components
3. Update documentation
4. Consider migration path for existing styles

### Performance Considerations:
- Use CSS custom properties for theming
- Minimize nesting depth (max 3 levels)
- Group related selectors
- Use utility classes for one-off styling
- Leverage Vite's CSS code splitting

## Browser Support

### Target Browsers:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Modern CSS Features Used:
- CSS Custom Properties (variables)
- CSS Grid and Flexbox
- `color-mix()` function
- Modern selectors (`:is()`, `:where()`)
- Container queries (when supported)

## Benefits Achieved

### Maintainability:
- Clear component boundaries
- Consistent naming conventions
- Modular architecture
- Easy to locate and modify styles

### Scalability:
- Component-based organization
- Reusable utility classes
- Design system foundation
- Responsive-first approach

### Developer Experience:
- Auto-completion with CSS custom properties
- Clear file organization
- Consistent patterns
- Documentation and examples

### Performance:
- Efficient CSS bundling
- Tree-shaking unused styles
- Optimized utility classes
- Modern CSS techniques