# 🧩 Componentes de Formulario Estandarizados

Este documento describe cómo usar los componentes de formulario estandarizados para mantener consistencia visual y funcional en toda la aplicación.

## 📦 Componentes Disponibles

### Input
Componente de entrada de texto con múltiples variantes y características avanzadas.

### TextArea
Área de texto con las mismas características del Input pero para texto multilínea.

### Select
Selector desplegable con opciones personalizables y flecha animada.

## 🚀 Instalación e Importación

```tsx
import { Input, TextArea, Select } from '../components/index.js';
```

## 📝 Input Component

### Uso Básico

```tsx
<Input
  label="Nombre"
  placeholder="Ingresa tu nombre"
  value={name}
  onChange={(e) => setName(e.target.value)}
/>
```

### Props Principales

| Prop | Tipo | Descripción |
|------|------|-------------|
| `label` | `string` | Etiqueta del campo |
| `error` | `string` | Mensaje de error |
| `success` | `string` | Mensaje de éxito |
| `variant` | `'default' \| 'floating' \| 'outline' \| 'filled'` | Variante visual |
| `size` | `'small' \| 'medium' \| 'large'` | Tamaño del componente |
| `leftIcon` | `React.ReactNode` | Icono a la izquierda |
| `rightIcon` | `React.ReactNode` | Icono a la derecha |
| `helperText` | `string` | Texto de ayuda |
| `required` | `boolean` | Campo requerido |

### Ejemplos de Uso

#### Con Iconos
```tsx
<Input
  label="Email"
  type="email"
  placeholder="ejemplo@correo.com"
  leftIcon={<span>📧</span>}
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={emailError}
/>
```

#### Floating Labels
```tsx
<Input
  variant="floating"
  label="Contraseña"
  type="password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  rightIcon={<span>🔒</span>}
  required
/>
```

#### Estados de Validación
```tsx
<Input
  label="Usuario"
  value={username}
  onChange={(e) => setUsername(e.target.value)}
  error={isError ? "Usuario no válido" : undefined}
  success={isValid ? "Usuario disponible" : undefined}
  helperText="Mínimo 3 caracteres"
/>
```

## 📄 TextArea Component

### Uso Básico

```tsx
<TextArea
  label="Descripción"
  placeholder="Escribe tu mensaje..."
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  rows={4}
/>
```

### Props Adicionales

| Prop | Tipo | Descripción |
|------|------|-------------|
| `resize` | `'none' \| 'vertical' \| 'horizontal' \| 'both'` | Control de redimensionamiento |
| `rows` | `number` | Número de filas |
| `cols` | `number` | Número de columnas |

### Ejemplo con Floating Label

```tsx
<TextArea
  variant="floating"
  label="Comentarios"
  value={comments}
  onChange={(e) => setComments(e.target.value)}
  resize="vertical"
  helperText="Máximo 500 caracteres"
/>
```

## 📋 Select Component

### Uso con Opciones Array

```tsx
const options = [
  { value: 'ar', label: 'Argentina' },
  { value: 'mx', label: 'México' },
  { value: 'es', label: 'España' }
];

<Select
  label="País"
  options={options}
  value={selectedCountry}
  onChange={(e) => setSelectedCountry(e.target.value)}
  placeholder="Selecciona un país"
/>
```

### Uso con Children

```tsx
<Select
  variant="floating"
  label="Categoría"
  value={category}
  onChange={(e) => setCategory(e.target.value)}
>
  <option value="">Selecciona una categoría</option>
  <option value="food">Comida</option>
  <option value="drinks">Bebidas</option>
  <option value="desserts">Postres</option>
</Select>
```

## 🎨 Variantes de Diseño

### Default
Diseño estándar con etiqueta superior y borde sólido.

### Floating
Etiqueta que flota hacia arriba cuando el campo tiene contenido o está enfocado.

### Outline
Fondo transparente con borde visible.

### Filled
Fondo gris claro que se vuelve blanco al enfocar.

## 📏 Tamaños

### Small
```tsx
<Input size="small" label="Campo pequeño" />
```

### Medium (Default)
```tsx
<Input size="medium" label="Campo mediano" />
```

### Large
```tsx
<Input size="large" label="Campo grande" />
```

## 🎯 Estados de Validación

### Error
```tsx
<Input
  label="Email"
  value={email}
  error="Formato de email inválido"
  onChange={handleEmailChange}
/>
```

### Success
```tsx
<Input
  label="Usuario"
  value={username}
  success="Usuario disponible"
  onChange={handleUsernameChange}
/>
```

### Disabled
```tsx
<Input
  label="Campo bloqueado"
  value={value}
  disabled
  helperText="Este campo está deshabilitado"
/>
```

## ♿ Características de Accesibilidad

- **IDs automáticos**: Cada componente genera IDs únicos automáticamente
- **ARIA labels**: Soporte completo para aria-describedby y aria-invalid
- **Navegación por teclado**: Focus management y escape key support
- **Lectores de pantalla**: Estructura semántica correcta

## 🔄 Migración desde Inputs Nativos

### Antes (Input nativo)
```tsx
<div className="form-group">
  <label>Usuario</label>
  <input
    type="text"
    placeholder="Ingresa tu usuario"
    value={username}
    onChange={(e) => setUsername(e.target.value)}
    className={error ? 'error' : ''}
  />
  {error && <span className="error-message">{error}</span>}
</div>
```

### Después (Componente estandarizado)
```tsx
<Input
  label="Usuario"
  placeholder="Ingresa tu usuario"
  value={username}
  onChange={(e) => setUsername(e.target.value)}
  error={error}
  leftIcon={<span>👤</span>}
/>
```

## 🎬 Ejemplos en Vivo

Visita las siguientes páginas para ver los componentes en acción:

- **`/components-demo`**: Demostración completa de todos los componentes
- **`/login-modern`**: Ejemplo de migración del formulario de login
- **`/form-demo`**: Formularios con CSS tradicional (para comparación)

## 💡 Mejores Prácticas

1. **Consistencia**: Usa siempre los mismos tamaños y variantes en formularios similares
2. **Validación**: Proporciona mensajes de error claros y específicos
3. **Iconos**: Usa iconos que sean intuitivos y consistentes
4. **Accesibilidad**: Siempre incluye labels y helper text cuando sea necesario
5. **Loading states**: Deshabilita campos durante operaciones asíncronas

## 🔧 Personalización

Los componentes respetan las variables CSS globales:

```css
:root {
  --color-primary: #f77f00;
  --color-danger: #d62828;
  --color-green: #38b000;
  --radius: 12px;
}
```

Para personalizar estilos específicos, puedes usar la prop `className` o agregar CSS custom.

## 🚀 Performance

- **Memorización**: Los componentes están optimizados con forwardRef
- **Bundle size**: Importación individual para reducir el tamaño del bundle
- **Re-renders**: Estado interno optimizado para minimizar re-renders innecesarios

---

¿Necesitas ayuda con estos componentes? Revisa las páginas de demostración o consulta el código fuente en `/src/ui/components/`.
