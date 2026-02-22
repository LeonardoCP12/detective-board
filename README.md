# 🕵️‍♂️ Detective Board

Un tablero de investigación digital interactivo para conectar pistas, evidencias y notas, inspirado en las películas de detectives y thrillers.

## 🌟 Características Principales

*   **🔒 Privacidad Total (Local):** Funciona como una "cuenta por dispositivo". Los datos se guardan en el `localStorage` del navegador. Nada se sube a la nube.
*   **🧩 Gestión de Evidencias:**
    *   **Notas:** Post-its para ideas rápidas.
    *   **Imágenes:** Sube archivos o pega directamente con `Ctrl + V`.
    *   **Enlaces Web:** Previsualización automática de sitios.
    *   **Videos:** Reproductor de YouTube integrado y limpio (sin anuncios ni distracciones).
    *   **Zonas:** Áreas para agrupar pistas relacionadas.
*   **🧵 Conexiones:** Une las evidencias con hilos de colores personalizables.
*   **📸 Exportación:** Genera una imagen PNG de alta calidad de tu caso (o de una selección) con marca de agua automática.
*   **🎨 Personalización:** Temas Claro/Oscuro y fondos realistas (Corcho, Pizarra, Papel).

## 🚀 Cómo usar

1.  **Accede al tablero:** https://LeonardoCP12.github.io/detective-board/
2.  **Añadir:** Arrastra elementos desde el menú lateral o haz doble clic en el fondo.
3.  **Conectar:** Arrastra desde los puntos (handles) de un nodo hacia otro.
4.  **Editar:** Haz doble clic en cualquier elemento o hilo para editarlo.
5.  **Atajos:** Pulsa `?` para ver la lista de atajos de teclado (como `Ctrl+L` para bloquear).

## 🛠️ Instalación Local (Desarrollo)

Si quieres modificar el código:

```bash
# 1. Clonar el repositorio
git clone https://github.com/LeonardoCP12/detective-board.git

# 2. Instalar dependencias
npm install

# 3. Iniciar servidor
npm run dev
```