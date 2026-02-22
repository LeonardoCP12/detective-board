export const processImage = (file, callback) => {
  if (!file || !file.type.startsWith('image/')) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    img.onload = () => {
      const maxDim = 400;
      let width = img.width;
      let height = img.height;
      
      // Mantener relación de aspecto y limitar tamaño
      if (width > maxDim || height > maxDim) {
        const ratio = width / height;
        if (width > height) {
          width = maxDim;
          height = maxDim / ratio;
        } else {
          height = maxDim;
          width = maxDim * ratio;
        }
      }

      // Comprimir imagen usando Canvas
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      
      // Exportar a JPEG con calidad 0.7
      const compressedImage = canvas.toDataURL('image/jpeg', 0.7);
      callback(compressedImage, width, height);
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
};
