# Lista de Chequeo: Navegación por Teclado y Lector de Pantalla

**Evaluador:** Estudiante LPW2  
**Fecha:** 18-10-2026  
**Lector de pantalla probado:** NVDA / Windows Narrator  
**Navegador:** Google Chrome / Microsoft Edge  

---

## 1. Navegación Exclusiva por Teclado (Sin Ratón)

| Elemento / Flujo | Teclas Usadas | Comportamiento Esperado | ¿Cumple? | Observaciones |
|:---|:---|:---|:---:|:---|
| **Salto al contenido principal** | `Tab` (al cargar página) | Aparece el enlace accesible "Saltar al contenido principal" en la esquina superior izquierda. Al presionar `Enter`, el foco salta directamente al contenido del `<main>`. | **SÍ** | Estilos `:focus` visibles con fondo azul. |
| **Foco visible en navegación** | `Tab` / `Shift+Tab` | Todos los enlaces del menú y el botón "Cerrar Sesión" presentan un contorno azul visible de 3 px con offset de 2 px. | **SÍ** | Regla `:focus-visible` activa globalmente. |
| **Formulario de login** | `Tab`, `Enter` | Foco se desplaza ordenadamente: Email → Contraseña → Botón Ingresar. Al pulsar `Enter`, se envía el formulario. | **SÍ** | Los campos cuentan con etiquetas explícitas. |
| **Filtros de canchas** | `Tab`, `Espacio`, `Flechas` | Los desplegables de Sede, Tipo y Estado se manipulan con las flechas del teclado sin perder el foco. | **SÍ** | Controles nativos `<select>`. |
| **Diálogo de confirmación** | `Enter`, `Tab`, `Escape` | Al presionar "Eliminar Cancha", se abre el `<dialog>`, el foco se posiciona en "Cancelar". Al presionar `Tab`, cicla entre "Cancelar" y "Sí, Eliminar" (trampa de foco). Al presionar `Escape`, se cancela y el foco vuelve al botón que lo abrió. | **SÍ** | Implementado con `<dialog>` nativo y trampa controlada. |

---

## 2. Compatibilidad con Lector de Pantalla (NVDA)

| Vista / Componente | Elemento ARIA | Lo que anuncia el lector | ¿Cumple? |
|:---|:---|:---|:---:|
| **Cambio de ruta** | `role="status"` `aria-live="polite"` (`.sr-only`) | "Página cargada: Listado de Canchas - CanchasYa", "Página cargada: Detalle de Cancha..." | **SÍ** |
| **Encabezado principal** | `<h1>` con `tabindex="-1"` | Enuncia el título principal de la vista recién cargada. | **SÍ** |
| **Campos obligatorios** | `<span class="required-mark" aria-hidden="true">*</span>` | Anuncia "Obligatorio" gracias a la validación nativa y atributos del input. | **SÍ** |
| **Errores de validación** | `aria-invalid="true"` + `aria-describedby` | "Inválido, El correo electrónico es requerido, Alerta". | **SÍ** |
| **Notificaciones Toast** | `role="status"` `aria-live="polite"` | "Cancha creada exitosamente", "Cancha eliminada correctamente". | **SÍ** |
| **Alertas de servidor** | `role="alert"` `aria-live="assertive"` | "Alerta: Credenciales incorrectas", "Alerta: Has superado el límite de intentos". | **SÍ** |
| **Iconos decorativos** | `aria-hidden="true"` | No interrumpe la lectura con caracteres innecesarios o emojis mudos. | **SÍ** |
