# AgroMendoza - PWA de Riego y Trámites para Productores

Aplicación Web Progresiva (**PWA**) diseñada específicamente para **productores agropecuarios y tomeros** de la provincia de Mendoza (Departamento General de Irrigación e Inspecciones de Cauce).

---

## 🌾 Principios de Usabilidad Aplicados al Campo

1. **Modo Pleno Sol (Ultra Alto Contraste)**:
   - Botón directo en la barra superior (ícono ☀️) que conmuta la interfaz a modo de máxima luminancia solar:
     - Fondo blanco puro (`#FFFFFF`) y texto negro absoluto (`#000000`).
     - Bordes negros gruesos de 2.5px y eliminación total de sombras grises y degradados tenues que se lavan con el reflejo del sol.

2. **Selector de Letra Grande (+20%)**:
   - Botón `A+` / `A-` en la cabecera para productores que no llevan sus anteojos de lectura al cuadro o hijuela.
   - Incrementa de manera fluida el tamaño de tipografía, números de turnos y áreas de toque a más de 62px.

3. **Grabación de Notas de Voz para el Tomero (Cero Tecleo con Manos de Trabajo)**:
   - Botón táctil grande con micrófono para grabar un mensaje de audio directo de hasta 45 segundos ("*Carlos, se desbordó la hijuela a la altura del callejón norte*").
   - Cuenta con cronómetro en vivo, reproductor integrado para escuchar la grabación y confirmación háptica.
   - Ideal para productores que usan guantes o tienen las manos sucias y prefieren hablar antes que teclear.

4. **Alta legibilidad bajo luz solar directa**:
   - Paleta sobria sin degradados: tipografía en gris oscuro casi negro (`#111827`) sobre fondos blancos nítidos.
   - Fuente **Atkinson Hyperlegible Next**, diseñada especialmente para facilitar la lectura inmediata y evitar confusión entre números y letras (horarios, padrones y compuertas).
   - Datos críticos (horas de riego, caudales, padrón) en números grandes y negritas pesadas.

5. **Ergonomía táctil para manos de trabajo**:
   - Botones y tarjetas interactivas con altura mínima de **54px a 62px**.
   - Separación generosa entre áreas de toque para evitar pulsaciones erróneas.
   - Respuesta física háptica (`navigator.vibrate`) en cada acción confirmada en el teléfono.

6. **Operación 100% Offline (Modo Campo sin señal)**:
   - En hijuelas y tomas suele haber nula conectividad celular.
   - La PWA cuenta con **Service Worker (`sw.js`)** y **Web App Manifest (`manifest.json`)**.
   - Los avisos de problemas de agua, audios y turnos del tomero se guardan inmediatamente en memoria local (`localStorage`), sincronizando automáticamente al recuperar cobertura.

5. **Llamadas y acciones directas en 1 toque**:
   - Botón directo de llamada telefónica al tomero (`tel:+5492615550192`) y a la guardia de la Inspección de Cauce (`tel:080033374346`).
   - Botón de alerta roja visible para emergencias de agua.
   - Renovación RUT Express con confirmación en un solo toque si no hubo cambios de cultivo.

---

## 📱 Pantallas y Módulos Integrados (Etapa 1)

El prototipo aplica **Separación Estricta de Vistas por Rol (RBAC)**:
- **Rol Productor (Don Alberto - G2C)**: Solo ve `Mi Riego`, `Trámites`, `Renovación RUT Express`, `Reportar Problema`, `Calendario del Turnero`, `Bot de WhatsApp Simulado` y el `Croquis de la Hijuela` en **modo solo lectura**.
- **Rol Tomero (Operador de Cauce #884 - G2G)**: Solo ve su barra operativa inferior (`Turnos Hoy` y `Croquis Compuertas`), con permisos exclusivos para registrar entregas de agua, abrir/cerrar compuertas y simular el reporte de rotura de canal.

| # | Pantalla / Módulo | Rol | Descripción |
| :- | :--- | :--- | :--- |
| **1** | **Mi Riego - Don Alberto** | Productor | Vista principal del productor: próximo turno confirmado (horario, compuerta, caudal), contacto del tomero, estado del canal, accesos rápidos al turnero y botón de alerta. |
| **2** | **Menú de Trámites** | Productor | Gestiones de cauce: padrones, comprobantes, pagos DGI/ATM y acceso a la declaración RUT. |
| **3** | **Reportar Problema con el Agua** | Productor | Formulario rápido con 3 opciones claras, grabador de notas de voz de hasta 45s, captura de foto con la cámara y garantía offline. |
| **4** | **Modo Campo (Tomero #884)** | Tomero | Vista de trabajo para el tomero en la hijuela: turno actual, compuertas, botones grandes para marcar "Agua Entregada" o "No Recibió" y botón de 1 toque **"Reportar Rotura en Canal (Simulado)"**. |
| **5** | **Renovación RUT Express** | Productor | Declaración jurada simplificada con **Precarga Catastral Once-Only (Polígono Parcela 12B DGI/ATM)** y firma digital en 1 toque. |
| **6** | **Calendario del Turnero (Quincenal / Mensual)** | Productor | Vista cronológica del mes: turnos programados, horas de dotación acumuladas y avisos destacados de **Corta de Canal** por limpieza. |
| **7** | **Esquema Lineal de la Hijuela (Croquis de Compuertas)** | Ambos (RBAC) | Trazado visual aguas arriba → aguas abajo (KM 0.0 a KM 5.8). En **Modo Productor** es de consulta (solo lectura); en **Modo Tomero** permite abrir/cerrar compuertas. |
| **8** | **Bot de WhatsApp Simulado** | Productor | Canal conversacional inclusivo (Etapa 1) donde Don Alberto consulta con 1 toque **"¿Cuándo me toca el agua?"** y recibe respuesta automática con su turno confirmado. |
| **9** | **Bandeja de Sincronización Visible** | Ambos | Pastilla persistente en cabecera que muestra la cantidad de registros guardados en la memoria del teléfono con opción de forzar sincronización manual. |

---

## 🚀 Cómo Iniciar y Probar la PWA

Puedes abrirla directamente en cualquier navegador o servirla localmente:

```bash
# Opción 1: Abrir el archivo index.html en el navegador
start index.html

# Opción 2: Iniciar servidor local
npm start
# O bien:
npx serve .
```

En dispositivos móviles (Chrome / Safari), selecciona **"Agregar a la pantalla principal"** para instalarla como aplicación nativa.
