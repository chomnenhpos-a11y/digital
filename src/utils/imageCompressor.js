import imageCompression from 'browser-image-compression';

// កំណត់ Default Options ដើម្បីកុំឱ្យពិបាកសរសេរច្រើនដង
const defaultOptions = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
};

export const compressImage = async (file, customOptions = {}) => {
  try {
    const options = { ...defaultOptions, ...customOptions };
    const compressedBlob = await imageCompression(file, options);
    
    return new File([compressedBlob], file.name, {
      type: compressedBlob.type,
      lastModified: Date.now(),
    });
  } catch (error) {
    console.error('Image compression error:', error);
    throw error;
  }
};

/**
 * សម្រាប់ Compress រូបភាពច្រើន (Multiple Images)
 */
export const compressMultipleImages = async (files, customOptions = {}) => {
  try {
    const fileArray = Array.from(files);
    const compressedFiles = await Promise.all(
      fileArray.map((file) => compressImage(file, customOptions))
    ); 
    return compressedFiles;
  } catch (error) {
    console.error('Multiple images compression error:', error);
    throw error;
  }
};