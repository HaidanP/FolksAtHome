function isHeicFile(file: File): boolean {
  return (
    /\.(heic|heif)$/i.test(file.name) ||
    file.type === 'image/heic' ||
    file.type === 'image/heif'
  );
}

function tryNativeLoad(url: string): Promise<boolean> {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

function drawToJpeg(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext('2d')!.drawImage(img, 0, 0);
      canvas.toBlob(
        blob => blob ? resolve(URL.createObjectURL(blob)) : reject(new Error('toBlob failed')),
        'image/jpeg',
        0.9,
      );
    };
    img.onerror = () => reject(new Error('decode failed'));
    img.src = src;
  });
}

export async function toPreviewUrl(file: File): Promise<string> {
  const objectUrl = URL.createObjectURL(file);

  if (!isHeicFile(file)) {
    return objectUrl;
  }

  // On iOS Safari and macOS Safari 16+ HEIC renders natively — use it directly
  const nativeOk = await tryNativeLoad(objectUrl);
  if (nativeOk) return objectUrl;

  // Browser can't render HEIC natively — draw through canvas to get a JPEG blob
  // (works when the OS image codec can decode it even if the browser won't render it directly)
  URL.revokeObjectURL(objectUrl);
  return drawToJpeg(URL.createObjectURL(file));
}

export function acceptsHeic(base = 'image/*') {
  return `${base},.heic,.heif`;
}

export async function toDataUrl(blobUrl: string): Promise<string> {
  const resp = await fetch(blobUrl);
  const blob = await resp.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
