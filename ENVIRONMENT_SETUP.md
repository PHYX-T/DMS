# TestCodex DMS Database & Environment Setup Guide

This guide addresses common PostgreSQL authentication and connection issues for the TestCodex Document Management System.

## Quick Setup

1. **Run the automated setup script:**
   ```bash
   ./scripts/setup-env.sh
   ```

2. **Or manually set up:**
   ```bash
   # Set PostgreSQL path
   export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"
   
   # Set database URL
   export DATABASE_URL="postgres://noorawla@localhost:5432/dms_dev"
   
   # Run migrations
   make migrate-psql
   ```

## Environment Files

### `.env` (Current Configuration)
Your working environment variables:
```bash
DATABASE_URL=postgres://noorawla@localhost:5432/dms_dev
PATH=/opt/homebrew/opt/postgresql@15/bin:${PATH}
HOST=127.0.0.1
PORT=8000
```

### `.env.example` (Template)
Copy this to `.env` and customize for different environments.

## Troubleshooting Authentication Issues

### 1. Password Authentication
If you encounter auth failures, you have several options:

**Option A: Add password to DATABASE_URL**
```bash
export DATABASE_URL="postgres://noorawla:yourpassword@localhost:5432/dms_dev"
```

**Option B: Use ~/.pgpass file**
```bash
echo "localhost:5432:dms_dev:noorawla:yourpassword" >> ~/.pgpass
chmod 600 ~/.pgpass
```

**Option C: Explicit host connection**
```bash
psql -h 127.0.0.1 -d dms_dev -U noorawla
```

### 2. Connection Issues

**Check PostgreSQL status:**
```bash
brew services list | grep postgresql
```

**Start PostgreSQL if needed:**
```bash
brew services start postgresql@15
```

**Test connection manually:**
```bash
psql -h 127.0.0.1 -d postgres -U noorawla
```

### 3. Version Mismatch

Version mismatch warnings are generally fine. PostgreSQL client 15 works with server 15.x.

**Check server version:**
```bash
brew services list | grep postgresql
psql --version
```

**If you have multiple PostgreSQL versions:**
```bash
# Use specific version
/opt/homebrew/opt/postgresql@15/bin/psql --version

# Check which server is running
brew services list | grep postgres
```

## Application Configuration

### Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgres://noorawla@localhost:5432/dms_dev` | PostgreSQL connection string |
| `HOST` | `127.0.0.1` | Application host |
| `PORT` | `8000` | Application port |
| `ENVIRONMENT` | `development` | Runtime environment |
| `DEBUG` | `true` | Enable debug mode |

### YAML Configuration

The app also supports YAML configuration via `config/config.example.yaml`:
- Document validation rules
- Security settings (SSO, RBAC)
- Storage configuration
- Search settings
- Notification preferences

## Development Workflow

1. **Setup environment:**
   ```bash
   make setup
   ```

2. **Run database migrations:**
   ```bash
   make migrate-psql
   ```

3. **Start the application:**
   ```bash
   make run
   ```

4. **Run tests:**
   ```bash
   make test
   ```

5. **Access the application:**
   - Main app: http://127.0.0.1:8000
   - Health check: http://127.0.0.1:8000/health
   - API endpoints: http://127.0.0.1:8000/validate?id=ABC-XY-ENG-PRO-001

## Common Commands

```bash
# Environment setup
./scripts/setup-env.sh

# Database operations
createdb dms_dev                    # Create database
dropdb dms_dev                      # Drop database (careful!)
psql dms_dev                        # Connect to database
make migrate-psql                   # Run migrations

# Application operations
make setup                          # Install dependencies
make run                            # Start server
make test                           # Run tests
make lint                           # Check code style
make format                         # Format code
```

## Security Notes

- Never commit passwords to `.env` files
- Use `.env.example` for templates
- Consider using `.pgpass` for password management
- Ensure proper PostgreSQL user privileges
- Review `pg_hba.conf` for authentication settings

## Support

If you continue to have issues:
1. Check the setup script output: `./scripts/setup-env.sh`
2. Verify PostgreSQL is running: `brew services list`
3. Test basic connection: `psql -h 127.0.0.1 -d postgres -U noorawla`
4. Check database exists: `psql -d postgres -c "\l"`