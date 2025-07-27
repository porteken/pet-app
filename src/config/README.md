# Config

This folder contains global configuration files and environment setup.

## Structure

- **supabase/**: Supabase client and server configuration
- **env.ts**: Environment variable validation and types (future)
- **app.ts**: Application-wide configuration constants (future)

## Guidelines

- Keep configuration separate from business logic
- Export typed configuration objects
- Validate environment variables at startup
- Document all configuration options
