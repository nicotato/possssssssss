# 🚀 Deployment a GitHub Pages

Este documento explica cómo configurar tu aplicación POS Pizzería para que se despliegue automáticamente en GitHub Pages.

## 📋 Pasos para Configurar GitHub Pages

### 1. Subir el Proyecto a GitHub

```bash
# Inicializar el repositorio Git (si no está inicializado)
git init

# Agregar todos los archivos
git add .

# Hacer el primer commit
git commit -m "Initial commit: POS Pizzería with modern components"

# Conectar con tu repositorio de GitHub
git remote add origin https://github.com/TU_USUARIO/pos-pizzeria.git

# Subir a GitHub
git push -u origin main
```

**Nota**: Asegúrate de reemplazar `TU_USUARIO` con tu nombre de usuario de GitHub.

### 2. Activar GitHub Pages en tu Repositorio

1. Ve a tu repositorio en GitHub
2. Haz clic en **Settings** (Configuración)
3. Scroll hacia abajo hasta la sección **Pages**
4. En **Source**, selecciona **GitHub Actions**
5. ¡Listo! GitHub Pages está configurado.

### 3. Configuración Automática

✅ **Ya configurado automáticamente:**
- **Vite Config**: Configurado con `base: '/pos-pizzeria/'`
- **GitHub Actions**: Workflow en `.github/workflows/deploy.yml`
- **Scripts de Build**: `npm run build:github` para producción

### 4. Despliegue Automático

Cada vez que hagas `git push` a la rama `main`, GitHub Actions:

1. ⚡ Instala las dependencias
2. 🧪 Ejecuta los tests
3. 🏗️ Construye la aplicación para producción
4. 🚀 Despliega automáticamente a GitHub Pages

### 5. Acceder a tu Aplicación

Una vez desplegada, tu aplicación estará disponible en:

```
https://TU_USUARIO.github.io/pos-pizzeria/
```

## 🛠️ Scripts Disponibles

### Para Desarrollo Local
```bash
npm run dev                 # Servidor de desarrollo
npm run dev:open           # Servidor de desarrollo + abrir navegador
npm run test               # Ejecutar tests
npm run preview            # Vista previa de build local
```

### Para GitHub Pages
```bash
npm run build:github       # Build optimizado para GitHub Pages
npm run preview:github     # Vista previa con base path de GitHub
```

## 📁 Estructura de Archivos Agregados

```
.github/
  workflows/
    deploy.yml             # ✨ Workflow de deployment automático

vite.config.ts             # 🔧 Actualizado con base path
package.json               # 📦 Scripts nuevos agregados
GITHUB_PAGES_SETUP.md      # 📚 Esta documentación
```

## 🔧 Personalización

### Cambiar el Nombre del Repositorio

Si quieres cambiar el nombre del repositorio, actualiza:

1. **En `vite.config.ts`**:
   ```typescript
   base: process.env.NODE_ENV === 'production' ? '/TU_NUEVO_NOMBRE/' : '/',
   ```

2. **En `package.json`** (script `preview:github`):
   ```json
   "preview:github": "vite preview --base=/TU_NUEVO_NOMBRE/",
   ```

### Domain Personalizado (Opcional)

Para usar un dominio personalizado:

1. Crea un archivo `public/CNAME` con tu dominio:
   ```
   tu-dominio.com
   ```

2. En `vite.config.ts`, cambia el base a `'/'`:
   ```typescript
   base: '/',
   ```

## 🐛 Troubleshooting

### Si el deployment falla:

1. **Verifica que los tests pasen**:
   ```bash
   npm run test
   ```

2. **Verifica que el build funcione localmente**:
   ```bash
   npm run build:github
   npm run preview:github
   ```

3. **Verifica permisos en GitHub**:
   - Ve a Settings > Actions > General
   - Asegúrate de que "Read and write permissions" esté habilitado

### Si las rutas no funcionan:

- Verifica que el `base` en `vite.config.ts` coincida con el nombre del repositorio
- GitHub Pages solo funciona con HTTPS, asegúrate de usar URLs absolutas cuando sea necesario

## ✅ Checklist de Deployment

- [ ] Repositorio creado en GitHub
- [ ] Código subido a la rama `main`
- [ ] GitHub Pages activado con "GitHub Actions" como source
- [ ] Tests pasando: `npm run test`
- [ ] Build funcionando: `npm run build:github`
- [ ] Esperando a que GitHub Actions termine el deployment

## 🎉 ¡Listo!

Una vez completados estos pasos, tu aplicación POS Pizzería estará disponible públicamente en GitHub Pages con deployment automático cada vez que hagas cambios. 

**URL final**: `https://TU_USUARIO.github.io/pos-pizzeria/`