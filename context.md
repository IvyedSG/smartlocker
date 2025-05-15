
📐 Flujo General del Locker

Locker Disponible

El sistema muestra: “Disponible”

Se solicita el correo del usuario

Al hacer clic en “Usar Locker”:

Se envía un PIN por correo

El locker se abre

El sistema espera movimiento (Arduino notifica)

Cuando no hay movimiento por 2 segundos → se cierra automáticamente

Locker Ocupado

Muestra estado: “Ocupado”

Se solicita el PIN enviado por correo

Al introducir el PIN correcto:

El locker se abre

Después del retiro → se cierra → vuelve al estado inicial

🎯 Estados de Pantalla
Estado 1: Locker Disponible

╔════════════════════════════════════╗
║   Estado: ✅ DISPONIBLE            ║
╠════════════════════════════════════╣
║   📧 Ingrese su correo: [____]     ║
║   [🚪 Usar Locker]                 ║
╚════════════════════════════════════╝
→ Acción: se abre el locker, se envía PIN, entra en modo "esperando objeto".

Estado 2: Esperando Movimiento

╔════════════════════════════════════╗
║   Estado: 🚪 ABIERTO               ║
╠════════════════════════════════════╣
║   ⏳ Esperando que coloque objeto...║
║   Cerrando automáticamente en 2s...║
╚════════════════════════════════════╝
Estado 3: Locker Ocupado

╔════════════════════════════════════╗
║   Estado: 📦 OCUPADO               ║
╠════════════════════════════════════╣
║   🔐 Ingrese su PIN: [____]        ║
║   [🔓 Abrir Locker]                ║
╚════════════════════════════════════╝
→ Acción: el locker se abre si el PIN es válido.

Estado 4: Post-desbloqueo

╔════════════════════════════════════╗
║   Estado: ✅ DISPONIBLE            ║
╠════════════════════════════════════╣
║   Objeto retirado. Locker cerrado.║
╚════════════════════════════════════╝

🔁 Polling
useLockerData.js debe consultar cada 2-5 segundos para actualizar el estado visual del locker en tiempo real.

🖼️ Diseño Estético
Caja con bordes redondeados

Iconos emoji para hacerlo amigable (📦, ✅, 🚪, 🔐)

Colores claros/verdes para disponible, rojos/amarillos para errores/ocupado

Texto grande y botones grandes (modo táctil)

No requiere login, es un flujo público
