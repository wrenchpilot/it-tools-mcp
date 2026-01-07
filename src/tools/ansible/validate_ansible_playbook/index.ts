import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerValidateAnsiblePlaybook(server: McpServer) {
  server.registerTool("validate_ansible_playbook", {
    description: "Validate Ansible playbook syntax and structure",

  inputSchema: {
      playbook: z.string().describe("Ansible playbook YAML content"),
    },
    // VS Code compliance annotations
    annotations: {
      title: "Validate Ansible Playbook",

      
      readOnlyHint: false
    }
}, async ({ playbook }) => {
      if (!playbook?.trim()) {
        return {
          content: [
            {
              type: "text",
              text: "Please provide playbook content to validate",
            },
          ],
        };
      }

      try {
        const yaml = await import('js-yaml');
        let parsed: any;
        
        try {
          parsed = yaml.load(playbook);
        } catch (yamlError: any) {
          return {
            content: [
              {
                type: "text",
                text: `YAML syntax error: ${yamlError.message}`,
              },
            ],
          };
        }

        const errors: string[] = [];
        const warnings: string[] = [];

        // Basic playbook structure validation
        if (!Array.isArray(parsed)) {
          errors.push('Playbook must be a YAML array of plays');
        } else {
          // Validate each play
          parsed.forEach((play: any, index: number) => {
            const playNum = index + 1;
            
            if (typeof play !== 'object' || play === null) {
              errors.push(`Play ${playNum}: must be an object`);
              return;
            }

            // Check required fields
            if (!play.name && !play.hosts) {
              warnings.push(`Play ${playNum}: should have either 'name' or 'hosts' field`);
            }

            if (!play.hosts) {
              errors.push(`Play ${playNum}: missing required 'hosts' field`);
            }

            // Validate tasks
            if (play.tasks) {
              if (!Array.isArray(play.tasks)) {
                errors.push(`Play ${playNum}: 'tasks' must be an array`);
              } else {
                play.tasks.forEach((task: any, taskIndex: number) => {
                  const taskNum = taskIndex + 1;
                  
                  if (typeof task !== 'object' || task === null) {
                    errors.push(`Play ${playNum}, Task ${taskNum}: must be an object`);
                    return;
                  }

                  // Check for task action
                  const taskActions = Object.keys(task).filter(key => 
                    !['name', 'when', 'tags', 'become', 'become_user', 'vars', 'register', 'failed_when', 'changed_when', 'ignore_errors', 'notify'].includes(key)
                  );

                  if (taskActions.length === 0) {
                    errors.push(`Play ${playNum}, Task ${taskNum}: no action module specified`);
                  } else if (taskActions.length > 1) {
                    warnings.push(`Play ${playNum}, Task ${taskNum}: multiple action modules found: ${taskActions.join(', ')}`);
                  }

                  if (!task.name) {
                    warnings.push(`Play ${playNum}, Task ${taskNum}: should have a 'name' field for better readability`);
                  }
                });
              }
            }

            // Validate handlers
            if (play.handlers) {
              if (!Array.isArray(play.handlers)) {
                errors.push(`Play ${playNum}: 'handlers' must be an array`);
              }
            }

            // Check for common variables sections
            if (play.vars && typeof play.vars !== 'object') {
              errors.push(`Play ${playNum}: 'vars' must be an object`);
            }

            if (play.vars_files && !Array.isArray(play.vars_files)) {
              errors.push(`Play ${playNum}: 'vars_files' must be an array`);
            }
          });
        }

        let result = '';
        
        if (errors.length === 0 && warnings.length === 0) {
          result = '✅ Playbook validation passed! No errors or warnings found.';
        } else {
          if (errors.length > 0) {
            result += `❌ Errors found:\n${errors.map(error => `  • ${error}`).join('\n')}`;
          }
          
          if (warnings.length > 0) {
            if (result) result += '\n\n';
            result += `⚠️  Warnings:\n${warnings.map(warning => `  • ${warning}`).join('\n')}`;
          }
        }

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
              text: `Error validating playbook: ${error.message}`,
            },
          ],
        };
      }
    }
  );
}
