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

      // Normalize package entries: ensure registryType (camelCase), set versions, and normalize OCI identifiers
      if (Array.isArray(server.packages)) {
        server.packages = server.packages.map((p, idx) => {
          if (!p || typeof p !== 'object') return p;

          // Migrate snake_case to camelCase if present
          if (p.registry_type !== undefined) {
            p.registryType = p.registry_type;
            delete p.registry_type;
            serverChanged = true;
            console.log(`  📝 Migrated registry_type to registryType for package index ${idx}`);
          }

          // If this package references this repo (contains package name)
          if (typeof p.identifier === 'string' && p.identifier.includes(pkg.name)) {
            // Heuristic: if identifier contains a slash (docker registry) or registryType is oci => OCI image
            const looksLikeOci = p.identifier.includes('/') || (p.registryType && p.registryType.toLowerCase() === 'oci');

            if (looksLikeOci) {
              // Remove any tag (after last colon following last slash)
              let id = p.identifier;
              const lastSlash = id.lastIndexOf('/');
              const lastColon = id.lastIndexOf(':');
              if (lastColon > lastSlash) {
                id = id.slice(0, lastColon);
              }

              if (id !== p.identifier) {
                p.identifier = id;
                serverChanged = true;
                console.log(`  📝 Updated OCI identifier for package index ${idx} to ${id}`);
              }

              if (p.registryType !== 'oci') {
                p.registryType = 'oci';
                serverChanged = true;
                console.log(`  📝 Set registryType=oci for packages[${idx}]`);
              }
            } else {
              // Treat as npm package
              if (p.identifier !== pkg.name) {
                p.identifier = pkg.name;
                serverChanged = true;
                console.log(`  📝 Normalized npm identifier for package index ${idx} to ${pkg.name}`);
              }

              if (p.version !== pkg.version) {
                p.version = pkg.version;
                serverChanged = true;
                console.log(`  📝 Updated server.json.packages[${idx}].version to ${pkg.version}`);
              }

              if (p.registryType !== 'npm') {
                p.registryType = 'npm';
                serverChanged = true;
                console.log(`  📝 Set registryType=npm for packages[${idx}]`);
              }
            }
          }

          return p;
        });
      }

      // Ensure top-level version is in sync
      if (server.version !== pkg.version) {
        server.version = pkg.version;
        serverChanged = true;
        console.log(`  📝 Updated server.json version to ${pkg.version}`);
      }

      // Remove unsupported top-level fields that the registry rejects (e.g., status)
      if (server.status !== undefined) {
        delete server.status;
        serverChanged = true;
        console.log('  📝 Removed unsupported top-level field: status');
      }

      // Clean up any lingering snake_case properties on packages
      if (Array.isArray(server.packages)) {
        server.packages.forEach((p, idx) => {
          if (p && p.registry_type !== undefined) {
            // migrate then remove
            p.registryType = p.registry_type || p.registryType;
            delete p.registry_type;
            serverChanged = true;
            console.log(`  📝 Removed lingering registry_type field for package index ${idx}`);
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

function parseArgs() {
  const args = {};
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--oci-image' || a === '--image') {
      args.ociImage = argv[i + 1];
      i++;
    }
  }
  // allow env fallback
  if (!args.ociImage && process.env.OCI_IMAGE) args.ociImage = process.env.OCI_IMAGE;
  return args;
}

async function runIfMain() {
  const args = parseArgs();
  const updated = syncManifest();

  // If an OCI image was provided, update server.json package identifiers for registryType=="oci"
  try {
    const serverPath = path.join(process.cwd(), 'server.json');
    if (fs.existsSync(serverPath)) {
      const server = JSON.parse(fs.readFileSync(serverPath, 'utf8'));
      let changed = false;

      // Prefer explicit OCI image passed in via args
      if (args.ociImage) {
        if (Array.isArray(server.packages)) {
          server.packages = server.packages.map(p => {
            if (p && p.registryType === 'oci') {
              if (p.identifier !== args.ociImage) {
                p.identifier = args.ociImage;
                changed = true;
              }
            }
            return p;
          });
        }
        if (changed) {
          fs.writeFileSync(serverPath, JSON.stringify(server, null, 2) + '\n');
          console.log(`✅ server.json OCI identifiers updated to ${args.ociImage}`);
        } else {
          console.log('✨ server.json OCI identifiers already up to date');
        }
      } else {
        // No explicit image provided: try to align OCI identifiers to package.json version
        const pkgPath = path.join(process.cwd(), 'package.json');
        if (fs.existsSync(pkgPath)) {
          const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
          const desiredTag = `v${pkg.version}`;
          if (Array.isArray(server.packages)) {
            server.packages = server.packages.map(p => {
              if (p && p.registryType === 'oci' && typeof p.identifier === 'string') {
                // Only update identifiers that reference this package name to avoid touching unrelated images
                if (pkg.name && p.identifier.includes(pkg.name)) {
                  // If already ends with desired tag, skip
                  if (!p.identifier.endsWith(desiredTag)) {
                    const lastColon = p.identifier.lastIndexOf(':');
                    const lastSlash = p.identifier.lastIndexOf('/');
                    if (lastColon > lastSlash) {
                      // has a tag, replace it
                      p.identifier = p.identifier.slice(0, lastColon + 1) + desiredTag;
                    } else {
                      // no tag present, append
                      p.identifier = `${p.identifier}:${desiredTag}`;
                    }
                    changed = true;
                    console.log(`  📝 Updated OCI identifier for package to ${p.identifier}`);
                  }
                }
              }
              return p;
            });
          }

          if (changed) {
            fs.writeFileSync(serverPath, JSON.stringify(server, null, 2) + '\n');
            console.log(`✅ server.json OCI identifiers aligned to package.json version ${pkg.version}`);
          } else {
            console.log('✨ server.json OCI identifiers already match package.json version');
          }
        }
      }
    }
  } catch (err) {
    console.error('❌ Error updating server.json OCI identifiers:', err.message);
    process.exit(1);
  }

  return updated;
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith('sync-manifest.mjs')) {
  runIfMain();
}

export { syncManifest };
