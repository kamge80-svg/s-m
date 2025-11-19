# Security Guidelines

## Environment Variables

**IMPORTANT:** Never commit `.env` files to version control!

### Setup Instructions

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Supabase credentials in `.env`

3. Verify `.env` is in `.gitignore` (already configured)

## File Upload Security

### Implemented Protections

- **File Type Validation**: Only allowed image and video formats
- **File Size Limits**:
  - Images: 10MB max
  - Videos: 100MB max
- **Client-side validation** before upload

### Allowed Formats

**Images:** JPG, PNG, GIF, WebP  
**Videos:** MP4, MOV, AVI, WebM

## Input Validation

All user inputs are validated:

- **Username**: 3-30 characters, alphanumeric + underscore only
- **Email**: Valid email format
- **Password**: Minimum 8 characters, must contain uppercase, lowercase, and number
- **Text inputs**: Sanitized to prevent XSS attacks

## Best Practices

1. **Never expose API keys** in client-side code
2. **Always validate** user input on both client and server
3. **Use HTTPS** in production
4. **Enable RLS** (Row Level Security) in Supabase
5. **Regular security audits** of dependencies

## Reporting Security Issues

If you discover a security vulnerability, please email: [your-email@example.com]

Do NOT create public GitHub issues for security vulnerabilities.
