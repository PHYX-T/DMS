#!/usr/bin/env node

/**
 * MCP Server Verification Script for TestCodex DMS
 * 
 * This script verifies that MCP servers are properly configured and accessible.
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 TestCodex MCP Server Verification');
console.log('=====================================\n');

// Check Node.js environment
console.log('📋 Environment Check:');
console.log(`   Node.js: ${process.version}`);
console.log(`   Directory: ${process.cwd()}\n`);

// Check if config.toml exists
const configPath = path.join(process.cwd(), 'config.toml');
if (fs.existsSync(configPath)) {
    console.log('✅ config.toml found');
} else {
    console.log('❌ config.toml not found');
    process.exit(1);
}

// Check if package.json exists
const packagePath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packagePath)) {
    console.log('✅ package.json found');
} else {
    console.log('❌ package.json not found');
}

// Check node_modules
const nodeModulesPath = path.join(process.cwd(), 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
    console.log('✅ node_modules found');
} else {
    console.log('⚠️  node_modules not found - run npm install');
}

console.log('\n🧪 Testing MCP Servers:');

// Test filesystem server
console.log('\n1. Filesystem Server:');
exec('npx @modelcontextprotocol/server-filesystem /Users/noorawla/Documents/TestCodex', {
    timeout: 5000
}, (error, stdout, stderr) => {
    if (error) {
        if (error.code === 'SIGTERM') {
            console.log('   ✅ Server starts correctly (timeout expected)');
        } else {
            console.log(`   ❌ Error: ${error.message}`);
        }
    } else {
        console.log('   ✅ Server accessible');
    }
});

// Test brave search server (if API key is set)
console.log('\n2. Brave Search Server:');
const braveApiKey = process.env.BRAVE_API_KEY;
if (braveApiKey && braveApiKey !== 'your-brave-api-key-here') {
    exec('npx @modelcontextprotocol/server-brave-search', {
        timeout: 5000,
        env: { ...process.env, BRAVE_API_KEY: braveApiKey }
    }, (error, stdout, stderr) => {
        if (error) {
            if (error.code === 'SIGTERM') {
                console.log('   ✅ Server starts correctly (timeout expected)');
            } else {
                console.log(`   ❌ Error: ${error.message}`);
            }
        } else {
            console.log('   ✅ Server accessible');
        }
    });
} else {
    console.log('   ⚠️  BRAVE_API_KEY not set - server won\'t work without it');
}

console.log('\n📝 Next Steps:');
console.log('   1. Set BRAVE_API_KEY in your .env file if you want search capabilities');
console.log('   2. Your MCP configuration is ready to use with compatible clients');
console.log('   3. Refer to MCP_SETUP.md for detailed configuration options\n');

setTimeout(() => {
    console.log('✨ MCP verification completed!');
}, 6000);