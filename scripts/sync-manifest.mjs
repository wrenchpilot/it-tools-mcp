import fs from 'fs'
import path from 'path'

function syncManifest() {
  console.log('🔄 Syncing mcp-manifest.json with package.json...');

  try {
    const pkgPath = path.join(process.cwd(), 'package.json');
    const manifestPath = path.join(process.cwd(), 'mcp-manifest.json');

    if (!fs.existsSync(pkgPath)) throw new Error('package.json not found');
    if (!fs.existsSync(manifestPath)) throw new Error('mcp-manifest.json not found');

    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

    const fieldsToSync = {
      name: pkg.name,
      version: pkg.version,
      description: pkg.description,
      author: pkg.author,
      license: pkg.license,
      homepage: pkg.homepage,
      repository: pkg.repository
    };

    let hasChanges = false;
    const changes = [];

    Object.keys(fieldsToSync).forEach(field => {
      if (JSON.stringify(manifest[field]) !== JSON.stringify(fieldsToSync[field])) {
        manifest[field] = fieldsToSync[field];
        hasChanges = true;
        changes.push(`Updated ${field}`);
      }
    });

    if (pkg.keywords && Array.isArray(pkg.keywords)) {
      const mcpTags = ['mcp', 'model-context-protocol', 'vscode', 'vscode-mcp'];
      const uniqueTags = [...new Set([...mcpTags, ...pkg.keywords])].sort();
      if (JSON.stringify(manifest.tags) !== JSON.stringify(uniqueTags)) {
        manifest.tags = uniqueTags;
        hasChanges = true;
        changes.push('Updated tags');
      }
    }

    if (pkg.mcp && pkg.mcp.toolCount) {
      if (manifest.capabilities.tools !== pkg.mcp.toolCount) {
        manifest.capabilities.tools = pkg.mcp.toolCount;
        hasChanges = true;
        changes.push('Updated tool count');
      }
    }

    if (pkg.mcp && pkg.mcp.categories) {
      const categoryCount = pkg.mcp.categories.length;
      if (manifest.capabilities.categories !== categoryCount) {
        manifest.capabilities.categories = categoryCount;
        hasChanges = true;
        changes.push('Updated category count');
      }
    }

    if (hasChanges) {
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
      console.log('✅ mcp-manifest.json synced with package.json');
      changes.forEach(change => console.log(`  📝 ${change}`));
    } else {
      console.log('✨ mcp-manifest.json is already in sync');
    }

    // Also sync server.json version fields where present
    const serverPath = path.join(process.cwd(), 'server.json');
    if (fs.existsSync(serverPath)) {
      const server = JSON.parse(fs.readFileSync(serverPath, 'utf8'));
      let serverChanged = false;

      if (server.version !== pkg.version) {
        server.version = pkg.version;
        serverChanged = true;
        console.log(`  📝 Updated server.json version to ${pkg.version}`);
      }

      if (Array.isArray(server.packages)) {
        server.packages.forEach((p, idx) => {
          // If package item looks like this repo's package, update its version
          if (p && p.identifier && p.version && p.identifier === pkg.name) {
            if (p.version !== pkg.version) {
              server.packages[idx].version = pkg.version;
              serverChanged = true;
              console.log(`  📝 Updated server.json.packages[${idx}].version to ${pkg.version}`);
            }
          }
        });
      }

      if (serverChanged) {
        fs.writeFileSync(serverPath, JSON.stringify(server, null, 2) + '\n');
        console.log('✅ server.json synced with package.json');
        return true;
      } else {
        console.log('✨ server.json is already in sync');
        return false;
      }
    }

    return false;
  } catch (error) {
    console.error('❌ Error syncing files:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith('sync-manifest.mjs')) {
  syncManifest();
}

export { syncManifest };
