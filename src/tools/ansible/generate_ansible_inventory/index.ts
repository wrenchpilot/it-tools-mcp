import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerAnsibleInventoryParser(server: McpServer) {
  server.registerTool("generate_ansible_inventory", {
  description: "Parse and validate Ansible inventory files",
  inputSchema: {
      inventory: z.string().describe("Ansible inventory content (INI or YAML format)"),
    },
    // VS Code compliance annotations
    annotations: {
      title: "Generate Ansible Inventory",
      description: "Parse and validate Ansible inventory files",
      readOnlyHint: false
    }
}, async ({ inventory }) => {
      if (!inventory?.trim()) {
        return {
          content: [
            {
              type: "text",
              text: "Please provide inventory content to parse",
            },
          ],
        };
      }

      try {
        let parsed: any = {};
        const trimmed = inventory.trim();
        
        // Check if it's YAML format
        if (trimmed.startsWith('{') || trimmed.includes('---') || trimmed.includes(':')) {
          try {
            const yaml = await import('js-yaml');
            parsed = yaml.load(inventory);
          } catch (yamlError) {
            // Fall back to INI parsing
            parsed = parseINIInventory(inventory);
          }
        } else {
          // Parse as INI format
          parsed = parseINIInventory(inventory);
        }

        // Validate and format the result
        const result = formatInventoryResult(parsed);
        
        return {
          content: [
            {
              type: "text",
              text: result,
            },
          ],
        };

      } catch (error: any) {
        return {
          content: [
            {
              type: "text",
              text: `Error parsing inventory: ${error.message}`,
            },
          ],
        };
      }
    }
  );
}

// Helper function to parse INI format inventory
function parseINIInventory(inventory: string): any {
  const result: any = { all: { children: {}, hosts: {} } };
  const lines = inventory.split('\n');
  let currentGroup = 'all';
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith(';')) {
      continue;
    }
    
    // Group header
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      currentGroup = trimmed.slice(1, -1);
      
      // Handle group variables and children sections
      if (currentGroup.includes(':')) {
        const [groupName, section] = currentGroup.split(':');
        if (section === 'vars') {
          if (!result.all.children[groupName]) {
            result.all.children[groupName] = { hosts: {}, vars: {} };
          }
          currentGroup = `${groupName}:vars`;
        } else if (section === 'children') {
          if (!result.all.children[groupName]) {
            result.all.children[groupName] = { hosts: {}, children: {} };
          }
          currentGroup = `${groupName}:children`;
        }
      } else {
        if (!result.all.children[currentGroup]) {
          result.all.children[currentGroup] = { hosts: {} };
        }
      }
      continue;
    }
    
    // Parse host or variable lines
    if (currentGroup.endsWith(':vars')) {
      // Group variables
      const groupName = currentGroup.replace(':vars', '');
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=');
        if (!result.all.children[groupName].vars) {
          result.all.children[groupName].vars = {};
        }
        result.all.children[groupName].vars[key.trim()] = value.trim();
      }
    } else if (currentGroup.endsWith(':children')) {
      // Child groups
      const groupName = currentGroup.replace(':children', '');
      if (!result.all.children[groupName].children) {
        result.all.children[groupName].children = {};
      }
      result.all.children[groupName].children[trimmed] = {};
    } else {
      // Host entries
      const [hostname, ...varParts] = trimmed.split(/\s+/);
      const hostVars: any = {};
      
      // Parse host variables
      for (const varPart of varParts) {
        const [key, ...valueParts] = varPart.split('=');
        if (key && valueParts.length > 0) {
          hostVars[key] = valueParts.join('=');
        }
      }
      
      if (currentGroup === 'all') {
        result.all.hosts[hostname] = hostVars;
      } else {
        result.all.children[currentGroup].hosts[hostname] = hostVars;
      }
    }
  }
  
  return result;
}

// Helper function to format inventory parsing results
function formatInventoryResult(parsed: any): string {
  let result = '# Parsed Ansible Inventory\n\n';
  
  try {
    // Count totals
    let totalHosts = 0;
    let totalGroups = 0;
    
    function countHosts(obj: any): number {
      let count = 0;
      if (obj.hosts) {
        count += Object.keys(obj.hosts).length;
      }
      if (obj.children) {
        for (const child of Object.values(obj.children)) {
          count += countHosts(child);
        }
      }
      return count;
    }
    
    function countGroups(obj: any): number {
      let count = 0;
      if (obj.children) {
        count += Object.keys(obj.children).length;
        for (const child of Object.values(obj.children)) {
          count += countGroups(child);
        }
      }
      return count;
    }
    
    totalHosts = countHosts(parsed.all || parsed);
    totalGroups = countGroups(parsed.all || parsed);
    
    result += `## Summary\n`;
    result += `- Total Hosts: ${totalHosts}\n`;
    result += `- Total Groups: ${totalGroups}\n\n`;
    
    // List all groups and hosts
    function formatGroup(groupName: string, group: any, indent = 0): string {
      const spaces = '  '.repeat(indent);
      let output = `${spaces}## ${groupName}\n`;
      
      if (group.hosts && Object.keys(group.hosts).length > 0) {
        output += `${spaces}### Hosts:\n`;
        for (const [hostname, vars] of Object.entries(group.hosts)) {
          output += `${spaces}- ${hostname}`;
          if (vars && typeof vars === 'object' && Object.keys(vars).length > 0) {
            output += ` (vars: ${Object.keys(vars).join(', ')})`;
          }
          output += '\n';
        }
      }
      
      if (group.vars && Object.keys(group.vars).length > 0) {
        output += `${spaces}### Variables:\n`;
        for (const [key, value] of Object.entries(group.vars)) {
          output += `${spaces}- ${key}: ${value}\n`;
        }
      }
      
      if (group.children && Object.keys(group.children).length > 0) {
        output += `${spaces}### Child Groups:\n`;
        for (const [childName, child] of Object.entries(group.children)) {
          output += formatGroup(childName, child, indent + 1);
        }
      }
      
      return output + '\n';
    }
    
    if (parsed.all) {
      result += formatGroup('all', parsed.all);
    } else {
      // Handle direct group format
      for (const [groupName, group] of Object.entries(parsed)) {
        result += formatGroup(groupName, group);
      }
    }
    
  } catch (error: any) {
    result += `Error formatting inventory: ${error.message}`;
  }
  
  return result;
}
