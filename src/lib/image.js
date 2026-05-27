//https://www.haikel-fazzani.eu.org/javascript/convert-blob-to-base64
export async function blobToBase64(blob) {
    return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]); // Extract Base64 part
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

// https://pqina.nl/blog/compress-image-before-upload/
export async function compressImage(file) {
    const bitmap = await createImageBitmap(file);

    const canvas = document.createElement('canvas');
    const maxDim = 1024;

    let { width, height } = bitmap;

    if (Math.max(width, height) > maxDim) {
        const scale = maxDim / Math.max(width, height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
    }

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(bitmap, 0, 0, width, height);

    return await new Promise((resolve) => {
        canvas.toBlob(resolve, "image/jpeg", 0.8);
    })
}