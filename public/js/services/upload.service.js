// Cloudinary upload service
export const uploadService = {
    uploadImg,
}

// Compress image before upload
async function compressImage(file, maxSizeMB = 10, maxWidthOrHeight = 1920) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = (event) => {
            const img = new Image()
            img.src = event.target.result
            img.onload = () => {
                const canvas = document.createElement('canvas')
                let width = img.width
                let height = img.height

                // Resize if needed
                if (width > height) {
                    if (width > maxWidthOrHeight) {
                        height *= maxWidthOrHeight / width
                        width = maxWidthOrHeight
                    }
                } else {
                    if (height > maxWidthOrHeight) {
                        width *= maxWidthOrHeight / height
                        height = maxWidthOrHeight
                    }
                }

                canvas.width = width
                canvas.height = height

                const ctx = canvas.getContext('2d')
                ctx.drawImage(img, 0, 0, width, height)

                // Start with quality 0.9 and reduce if needed
                let quality = 0.9
                const tryCompress = () => {
                    canvas.toBlob((blob) => {
                        if (!blob) {
                            // If blob is null, try with different format
                            canvas.toBlob((pngBlob) => {
                                if (pngBlob) {
                                    resolve(new File([pngBlob], file.name.replace(/\.[^.]+$/, '.png'), { type: 'image/png' }))
                                } else {
                                    reject(new Error('Failed to compress image'))
                                }
                            }, 'image/png')
                            return
                        }
                        if (blob.size <= maxSizeMB * 1024 * 1024 || quality <= 0.1) {
                            resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }))
                        } else {
                            quality -= 0.1
                            tryCompress()
                        }
                    }, 'image/jpeg', quality)
                }
                tryCompress()
            }
            img.onerror = () => {
                console.error('Image failed to load, trying direct upload')
                // If image fails to load (e.g., HEIC format), return original file
                resolve(file)
            }
        }
        reader.onerror = () => {
            console.error('FileReader failed')
            resolve(file) // Return original file on error
        }
    })
}

async function uploadImg(file) {
    const CLOUD_NAME = 'vanilla-test-images' // TODO: change to your cloud name
    const UPLOAD_PRESET = 'stavs_preset'     // TODO: change to your upload preset
    const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`

    const formData = new FormData()

    // Building the request body
    // Support both file object and event object
    let imageFile = file instanceof File ? file : file.target.files[0]

    if (!imageFile) {
        throw new Error('No file provided')
    }

    // Always try to compress/convert for better compatibility
    try {
        const compressedFile = await compressImage(imageFile, 10, 2048)
        if (compressedFile && compressedFile.size < imageFile.size * 1.1) {
            imageFile = compressedFile
        }
    } catch (compressError) {
        // If compression fails, use original file
    }

    formData.append('file', imageFile)
    formData.append('upload_preset', UPLOAD_PRESET)

    try {
        const res = await fetch(UPLOAD_URL, { method: 'POST', body: formData })
        const imgData = await res.json()
        if (!res.ok) {
            throw new Error(`Upload failed: ${imgData.error?.message || 'Unknown error'}`)
        }
        const url = imgData.secure_url || imgData.url
        if (!url) {
            throw new Error('No URL returned from Cloudinary')
        }
        return url
    } catch (err) {
        throw err
    }
}
