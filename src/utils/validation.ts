// File upload validation constants and functions

export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
];

export const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
  'video/webm',
];

export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/epub+zip',
];

export const ALLOWED_AUDIO_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
];

export const ALLOWED_ARCHIVE_TYPES = [
  'application/zip',
  'application/x-zip-compressed',
  'application/x-rar-compressed',
];

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateImageFile(file: File): ValidationResult {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid image format. Allowed: JPG, PNG, GIF, WebP',
    };
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return {
      valid: false,
      error: `Image too large. Maximum size: ${MAX_IMAGE_SIZE / 1024 / 1024}MB`,
    };
  }

  return { valid: true };
}

export function validateVideoFile(file: File): ValidationResult {
  if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid video format. Allowed: MP4, MOV, AVI, WebM',
    };
  }

  if (file.size > MAX_VIDEO_SIZE) {
    return {
      valid: false,
      error: `Video too large. Maximum size: ${MAX_VIDEO_SIZE / 1024 / 1024}MB`,
    };
  }

  return { valid: true };
}

export function validateMediaFile(file: File): ValidationResult {
  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');
  const isDocument = ALLOWED_DOCUMENT_TYPES.includes(file.type);
  const isAudio = ALLOWED_AUDIO_TYPES.includes(file.type);
  const isArchive = ALLOWED_ARCHIVE_TYPES.includes(file.type);

  if (!isImage && !isVideo && !isDocument && !isAudio && !isArchive) {
    return {
      valid: false,
      error: 'File type not supported. Allowed: images, videos, PDF, EPUB, MP3, ZIP',
    };
  }

  if (isImage) {
    return validateImageFile(file);
  }

  if (isVideo) {
    return validateVideoFile(file);
  }

  // For other file types, check size only
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  return { valid: true };
}

export function getFileType(file: File): string {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  if (file.type.startsWith('audio/')) return 'audio';
  if (file.type === 'application/pdf') return 'pdf';
  if (file.type === 'application/epub+zip') return 'ebook';
  if (ALLOWED_ARCHIVE_TYPES.includes(file.type)) return 'archive';
  return 'file';
}

export function getFileIcon(fileType: string): string {
  const icons: Record<string, string> = {
    image: '🖼️',
    video: '🎥',
    audio: '🎵',
    pdf: '📄',
    ebook: '📚',
    archive: '📦',
    file: '📁',
  };
  return icons[fileType] || '📁';
}

// Sanitize user input to prevent XSS
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Validate URL format
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Validate username format
export function validateUsername(username: string): ValidationResult {
  if (username.length < 3) {
    return {
      valid: false,
      error: 'Username must be at least 3 characters',
    };
  }

  if (username.length > 30) {
    return {
      valid: false,
      error: 'Username must be less than 30 characters',
    };
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return {
      valid: false,
      error: 'Username can only contain letters, numbers, and underscores',
    };
  }

  return { valid: true };
}

// Validate email format
export function validateEmail(email: string): ValidationResult {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return {
      valid: false,
      error: 'Invalid email format',
    };
  }

  return { valid: true };
}

// Validate password strength
export function validatePassword(password: string): ValidationResult {
  if (password.length < 8) {
    return {
      valid: false,
      error: 'Password must be at least 8 characters',
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      error: 'Password must contain at least one uppercase letter',
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      valid: false,
      error: 'Password must contain at least one lowercase letter',
    };
  }

  if (!/[0-9]/.test(password)) {
    return {
      valid: false,
      error: 'Password must contain at least one number',
    };
  }

  return { valid: true };
}
