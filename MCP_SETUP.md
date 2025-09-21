# MCP (Model Context Protocol) Setup Guide

This guide explains how to configure and use MCP servers with your TestCodex Document Management System.

## What are MCP Servers?

MCP servers extend your development environment by providing additional tools and capabilities that can be used by AI assistants and development tools. They enable access to:

- File systems and databases
- External APIs and services  
- Search engines and data sources
- Custom business logic and workflows

## Current MCP Configuration

The [config.toml](file:///Users/noorawla/Documents/TestCodex/config.toml) file contains pre-configured MCP servers:

### 1. Filesystem Server
- **Purpose**: Direct file system access for your project
- **Scope**: `/Users/noorawla/Documents/TestCodex` directory
- **Capabilities**: Read, write, create, delete files and directories

### 2. SQLite Server  
- **Purpose**: Local SQLite database operations
- **Database**: `database.db` in project root
- **Capabilities**: Execute queries, manage schema, data manipulation

### 3. Brave Search Server
- **Purpose**: Web search capabilities
- **Requirement**: Brave API key needed
- **Capabilities**: Search web content, get real-time information

### 4. PostgreSQL Server
- **Purpose**: Direct PostgreSQL database access
- **Database**: Your TestCodex `dms_dev` database
- **Capabilities**: Query execution, schema inspection, data management

## How to Add/Modify MCP Servers

### Adding a New MCP Server

1. **Edit config.toml:**
   ```toml
   [mcpServers.your-server-name]
   command = "npx"
   args = ["-y", "@modelcontextprotocol/server-package"]
   env = { "API_KEY" = "your-api-key" }
   startup_timeout_ms = 10000
   ```

2. **Common MCP Servers:**

   **GitHub Server:**
   ```toml
   [mcpServers.github]
   command = "npx"
   args = ["-y", "@modelcontextprotocol/server-github"]
   env = { "GITHUB_PERSONAL_ACCESS_TOKEN" = "your-github-token" }
   startup_timeout_ms = 10000
   ```

   **Slack Server:**
   ```toml
   [mcpServers.slack]
   command = "npx"
   args = ["-y", "@modelcontextprotocol/server-slack"]
   env = { 
     "SLACK_BOT_TOKEN" = "xoxb-your-bot-token",
     "SLACK_TEAM_ID" = "your-team-id"
   }
   startup_timeout_ms = 10000
   ```

   **Memory Server:**
   ```toml
   [mcpServers.memory]
   command = "npx"
   args = ["-y", "@modelcontextprotocol/server-memory"]
   startup_timeout_ms = 10000
   ```

### Configuration Parameters

- **command**: The executable to run (usually `npx` for Node.js packages)
- **args**: Command-line arguments, typically the package name
- **env**: Environment variables (API keys, database URLs, etc.)
- **startup_timeout_ms**: How long to wait for server startup (default: 10000ms)

## Setting Up API Keys

### 1. Brave Search API
1. Visit [Brave Search API](https://api.search.brave.com/)
2. Sign up and get your API key
3. Update config.toml:
   ```toml
   [mcpServers.brave-search]
   env = { "BRAVE_API_KEY" = "your-actual-api-key" }
   ```

### 2. GitHub API (if adding GitHub server)
1. Go to GitHub Settings > Developer settings > Personal access tokens
2. Generate a new token with appropriate permissions
3. Add to config.toml

### 3. Environment Variables Alternative
Instead of putting keys directly in config.toml, you can use environment variables:

**In config.toml:**
```toml
[mcpServers.brave-search]
env = { "BRAVE_API_KEY" = "${BRAVE_API_KEY}" }
```

**In your .env file:**
```bash
BRAVE_API_KEY=your-actual-api-key
```

## TestCodex-Specific MCP Use Cases

### 1. Document Management
- **Filesystem Server**: Access document files, templates, and archives
- **PostgreSQL Server**: Query document metadata, audit logs, validation rules

### 2. Quality Management
- **GitHub Server**: Access ISO 9001 compliance documentation
- **Search Server**: Look up quality standards and best practices

### 3. Development Workflow
- **Memory Server**: Store project context and development notes
- **SQLite Server**: Local development database for testing

### 4. Integration & Automation
- **Slack Server**: Notifications for document approvals
- **GitHub Server**: Link documents to code repositories

## Troubleshooting MCP Setup

### Common Issues

1. **Server Won't Start**
   ```bash
   # Check if Node.js/npm is installed
   node --version
   npm --version
   
   # Manually test server installation
   npx @modelcontextprotocol/server-filesystem --help
   ```

2. **Timeout Issues**
   - Increase `startup_timeout_ms` for slow servers
   - Check network connectivity for API-based servers

3. **Permission Errors**
   - Ensure file system paths are accessible
   - Check API key permissions and validity

4. **Environment Variable Issues**
   ```bash
   # Check if variables are set
   echo $BRAVE_API_KEY
   
   # Source your .env file
   source .env
   ```

### Testing MCP Configuration

1. **Validate TOML syntax:**
   ```bash
   python3 -c "import tomli; tomli.load(open('config.toml', 'rb'))"
   ```

2. **Test individual servers:**
   ```bash
   npx @modelcontextprotocol/server-filesystem /Users/noorawla/Documents/TestCodex
   ```

## Best Practices

1. **Security:**
   - Never commit API keys to version control
   - Use environment variables for sensitive data
   - Regularly rotate API keys

2. **Performance:**
   - Set appropriate timeout values
   - Only enable servers you actually use
   - Monitor resource usage

3. **Maintenance:**
   - Keep MCP server packages updated
   - Document custom configurations
   - Test configurations after changes

## Next Steps

1. **Test Current Setup:**
   - Verify Node.js is installed
   - Test filesystem server access
   - Set up Brave API key if needed

2. **Enhance for TestCodex:**
   - Add GitHub server for repository integration
   - Configure memory server for project context
   - Set up document-specific automation

3. **Custom Integrations:**
   - Create custom MCP server for ISO 9001 workflows
   - Integrate with quality management tools
   - Add document approval workflow automation

For more information about available MCP servers, visit the [Model Context Protocol documentation](https://github.com/modelcontextprotocol).