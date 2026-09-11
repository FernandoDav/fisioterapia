# Documentación de Diseño - Sistema Fisioterapia

## Sistema de Diseño Consistente

### 1. Sistema de Colores

#### Colores Principales
- **Teal (#13bfc2)**: Acciones principales, elementos interactivos, estados activos
- **Ink (#075b9d)**: Textos importantes, títulos, encabezados
- **Coral (#0878b9)**: Elementos destacados, notificaciones, alertas
- **Mint (#dff8f7)**: Fondos de estados activos, hover states
- **Cream (#f4fbfc)**: Fondo principal de la aplicación
- **White (#ffffff)**: Fondos de tarjetas, paneles, formularios

#### Colores de Estados
- **Éxito (#3c9b72)**: Completado, pagado, exitoso
- **Advertencia (#d39b42)**: Pendiente, necesita atención
- **Error (#bd554d)**: Urgente, fallo, requiere acción
- **Muted (#668894)**: Texto secundario, información auxiliar
- **Line (#cfe9ec)**: Bordes sutiles, separadores

### 2. Tipografía

#### Fuentes
- **Manrope**: Títulos, encabezados, números importantes
  - Peso: 800 (extra-bold)
  - Usar para: h1, h2, h3, badges importantes
  
- **DM Sans**: Texto de cuerpo, formularios, interfaces
  - Pesos: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
  - Usar para: p, span, botones, inputs

#### Tamaños de Texto
- **h1**: 32px (Manrope 800)
- **h2**: 24px (Manrope 800)
- **h3**: 18px (Manrope 800)
- **h4**: 16px (Manrope 800)
- **Lead**: 14px (DM Sans)
- **Body**: 13px (DM Sans)
- **Small**: 11px (DM Sans)
- **X-Small**: 10px (DM Sans)

### 3. Componentes UI

#### Botones
```css
.btn-primary {
  background: var(--primary-color);
  color: var(--background-white);
  padding: 12px 18px;
  border-radius: 6px;
  font-weight: 700;
}

.btn-secondary {
  background: var(--background-white);
  color: var(--primary-color);
  border: 1px solid var(--border-color);
  padding: 11px 17px;
}
```

#### Tarjetas y Paneles
```css
.card {
  background: var(--background-white);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(7, 91, 157, 0.05);
}

.panel {
  background: var(--background-white);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 18px;
}
```

#### Formularios
```css
.form-control {
  width: 100%;
  border: 1px solid var(--border-color);
  border-radius: 7px;
  padding: 13px 14px;
  font-size: 13px;
}

.form-label {
  color: var(--secondary-color);
  font-weight: 600;
  font-size: 12px;
  margin-bottom: 8px;
}
```

#### Tablas
```css
.table th {
  background: var(--background-light);
  color: var(--text-muted);
  font-size: 10px;
  text-transform: uppercase;
  padding: 14px 16px;
}

.table td {
  padding: 14px 16px;
  border-bottom: 1px solid var(--border-color);
  font-size: 12px;
}
```

### 4. Estados Visuales

#### Badges
```css
.badge-success {
  background: rgba(60, 155, 114, 0.1);
  color: var(--success-color);
  padding: 4px 10px;
  border-radius: 12px;
}
```

#### Alertas
```css
.alert-success {
  background: rgba(60, 155, 114, 0.05);
  border-left: 4px solid var(--success-color);
  padding: 12px 16px;
}
```

### 5. Espaciado y Grid

#### Espaciado Base
- **xs**: 8px
- **sm**: 16px
- **md**: 24px
- **lg**: 32px
- **xl**: 40px

#### Grid System
```css
.grid-2 { grid-template-columns: repeat(2, 1fr); }
.grid-3 { grid-template-columns: repeat(3, 1fr); }
.grid-4 { grid-template-columns: repeat(4, 1fr); }
```

### 6. Iconografía y Símbolos

#### Íconos de Menú
- Inicio: ⌂
- Pacientes: ♙
- Facturación: ▣
- Agenda: ▦
- Estadísticas: ◒
- Empleados: ♧
- Pagos equipo: ◌
- Recordatorios: ♧
- Calculadora: ＋
- Historial: ◷
- Precios y servicios: ＄

### 7. Animaciones y Transiciones

#### Transiciones Base
```css
transition: all 0.2s ease;
```

#### Animaciones
```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
```

### 8. Responsive Design

#### Breakpoints
- **Mobile**: hasta 480px
- **Tablet**: hasta 900px
- **Desktop**: más de 900px

#### Reglas Responsive
```css
@media (max-width: 900px) {
  .grid-2, .grid-3, .grid-4 {
    grid-template-columns: 1fr;
  }
}
```

### 9. Directrices de Accesibilidad

#### Contraste de Color
- Texto principal sobre fondo claro: mínimo 4.5:1
- Texto grande sobre fondo claro: mínimo 3:1
- Elementos interactivos: contraste claro

#### Navegación por Teclado
- Todos los elementos interactivos deben ser focusables
- Orden de tabulación lógico
- Skip links para navegación rápida

#### ARIA Labels
- Iconos sin texto deben tener aria-label
- Elementos interactivos complejos deben tener roles ARIA apropiados

### 10. Patrones de Diseño Específicos

#### Layout de Login
- Grid de 46% | 54% en desktop
- Stack vertical en mobile
- Logo visible en ambos lados

#### Sidebar de Navegación
- Ancho fijo de 240px
- Posición fija en desktop
- Transform slide en mobile

#### Topbar de Sesión
- Altura: 117px en desktop, 90px en mobile
- Posición sticky
- Acciones contextuales del usuario

#### Paneles de Contenido
- Max-width: 1450px
- Padding responsive
- Grid layout flexible

### 11. Convenciones de Nombrado CSS

#### BEM (Block Element Modifier)
```css
.block {}
.block__element {}
.block--modifier {}
```

#### Variables CSS
- Usar prefijos consistentes: --color-, --font-, --spacing-
- Nombres descriptivos en inglés
- Agrupadas por funcionalidad

### 12. Checklist de Consistencia

Para cada nueva vista o componente, verificar:

- [ ] Usa el sistema de colores definido
- [ ] Sigue la jerarquía tipográfica
- [ ] Implementa componentes UI consistentes
- [ ] Tiene espaciado consistente
- [ ] Es responsive
- [ ] Es accesible
- [ ] Sigue patrones de interacción establecidos
- [ ] Usa iconografía consistente
- [ ] Tiene estados visuales claros
- [ ] Documenta variaciones específicas

---

**Última Actualización**: Septiembre 2026  
**Responsable**: Equipo de Diseño - Fisio Clinica