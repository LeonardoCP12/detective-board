// maxDim: tamaño máximo en px (default 400 para miniaturas en evidencias)
// quality: calidad JPEG 0-1 (default 0.7)
export const processImage = (file, callback, maxDim = 400, quality = 0.7) => {
  if (!file || !file.type.startsWith('image/')) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    img.onload = () => {
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

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      const compressedImage = canvas.toDataURL('image/jpeg', quality);
      callback(compressedImage, width, height);
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
};