import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerReferenceAnsible(server: McpServer) {
  server.registerTool("show_ansible_reference", {

  inputSchema: {},
    // VS Code compliance annotations
    annotations: {
      title: "Show Ansible Reference",

      readOnlyHint: true
    }
}, async () => {
      const reference = `# Ansible Quick Reference

## Installation
\`\`\`bash
# Install via pip
pip install ansible

# Install via apt (Ubuntu/Debian)
sudo apt update
sudo apt install ansible

# Install via yum (CentOS/RHEL)
sudo yum install ansible

# Verify installation
ansible --version
\`\`\`

## Configuration Files
- \`/etc/ansible/ansible.cfg\` - Global configuration
- \`~/.ansible.cfg\` - User configuration
- \`./ansible.cfg\` - Project configuration
- \`/etc/ansible/hosts\` - Default inventory file

## Basic Commands
\`\`\`bash
# Run ad-hoc command
ansible <hosts> -m <module> -a "<arguments>"

# Run playbook
ansible-playbook playbook.yml

# Check playbook syntax
ansible-playbook --syntax-check playbook.yml

# Dry run (check mode)
ansible-playbook --check playbook.yml

# Limit to specific hosts
ansible-playbook -l <host_pattern> playbook.yml

# Use specific inventory
ansible-playbook -i inventory.ini playbook.yml

# Ask for sudo password
ansible-playbook --ask-become-pass playbook.yml
\`\`\`

## Inventory Examples

### INI Format
\`\`\`ini
[webservers]
web1.example.com
web2.example.com

[databases]
db1.example.com
db2.example.com

[production:children]
webservers
databases

[webservers:vars]
http_port=80
max_clients=200
\`\`\`

### YAML Format
\`\`\`yaml
all:
  children:
    webservers:
      hosts:
        web1.example.com:
        web2.example.com:
      vars:
        http_port: 80
        max_clients: 200
    databases:
      hosts:
        db1.example.com:
        db2.example.com:
\`\`\`

## Playbook Structure
\`\`\`yaml
---
- name: Configure web servers
  hosts: webservers
  become: yes
  vars:
    http_port: 80
  
  tasks:
    - name: Install Apache
      package:
        name: apache2
        state: present
    
    - name: Start Apache service
      service:
        name: apache2
        state: started
        enabled: yes
  
  handlers:
    - name: restart apache
      service:
        name: apache2
        state: restarted
\`\`\`

## Common Modules

### Package Management
\`\`\`yaml
# Install package
- package:
    name: nginx
    state: present

# Install specific version
- package:
    name: nginx=1.18.0
    state: present

# Remove package
- package:
    name: nginx
    state: absent
\`\`\`

### Service Management
\`\`\`yaml
# Start and enable service
- service:
    name: nginx
    state: started
    enabled: yes

# Stop service
- service:
    name: nginx
    state: stopped
\`\`\`

### File Operations
\`\`\`yaml
# Copy file
- copy:
    src: /local/file.txt
    dest: /remote/file.txt
    owner: root
    group: root
    mode: '0644'

# Create directory
- file:
    path: /path/to/directory
    state: directory
    mode: '0755'

# Create symlink
- file:
    src: /path/to/source
    dest: /path/to/link
    state: link
\`\`\`

### Template
\`\`\`yaml
- template:
    src: nginx.conf.j2
    dest: /etc/nginx/nginx.conf
    owner: root
    group: root
    mode: '0644'
  notify: restart nginx
\`\`\`

### Command Execution
\`\`\`yaml
# Run command
- command: /bin/ls -la /tmp

# Run shell command
- shell: echo "Hello" > /tmp/hello.txt

# Raw command (no processing)
- raw: /bin/ls
\`\`\`

## Variables and Facts

### Variable Files
\`\`\`yaml
# vars.yml
database_name: myapp
database_user: myuser
database_password: mypass
\`\`\`

### Using Variables
\`\`\`yaml
- name: Create database
  mysql_db:
    name: "{{ database_name }}"
    state: present
\`\`\`

### Gathering Facts
\`\`\`yaml
# Disable fact gathering
- hosts: all
  gather_facts: no

# Use facts
- debug:
    msg: "OS is {{ ansible_distribution }}"
\`\`\`

## Conditionals and Loops

### Conditionals
\`\`\`yaml
- name: Install package on Ubuntu
  package:
    name: apache2
    state: present
  when: ansible_distribution == "Ubuntu"
\`\`\`

### Loops
\`\`\`yaml
# Simple loop
- name: Install packages
  package:
    name: "{{ item }}"
    state: present
  loop:
    - nginx
    - git
    - curl

# Loop with dictionaries
- name: Create users
  user:
    name: "{{ item.name }}"
    group: "{{ item.group }}"
  loop:
    - { name: 'alice', group: 'admins' }
    - { name: 'bob', group: 'users' }
\`\`\`

## Handlers
\`\`\`yaml
tasks:
  - name: Copy config file
    copy:
      src: nginx.conf
      dest: /etc/nginx/nginx.conf
    notify:
      - restart nginx
      - reload nginx

handlers:
  - name: restart nginx
    service:
      name: nginx
      state: restarted
  
  - name: reload nginx
    service:
      name: nginx
      state: reloaded
\`\`\`

## Vault (Encryption)
\`\`\`bash
# Create encrypted file
ansible-vault create secret.yml

# Edit encrypted file
ansible-vault edit secret.yml

# Encrypt existing file
ansible-vault encrypt file.yml

# Decrypt file
ansible-vault decrypt file.yml

# View encrypted file
ansible-vault view secret.yml

# Run playbook with vault
ansible-playbook --ask-vault-pass playbook.yml
ansible-playbook --vault-password-file vault_pass.txt playbook.yml
\`\`\`

## Roles Structure
\`\`\`
roles/
  webserver/
    tasks/
      main.yml
    handlers/
      main.yml
    templates/
      nginx.conf.j2
    files/
      index.html
    vars/
      main.yml
    defaults/
      main.yml
    meta/
      main.yml
\`\`\`

## Best Practices
- Use descriptive task names
- Organize with roles and includes
- Use variables for configuration
- Always use version control
- Test with \`--check\` mode first
- Use handlers for service restarts
- Make playbooks idempotent
- Use tags for selective execution
- Keep secrets in vault files

## Common Patterns

### Rolling Updates
\`\`\`yaml
- hosts: webservers
  serial: 1
  max_fail_percentage: 25
\`\`\`

### Tags
\`\`\`yaml
- name: Install packages
  package:
    name: nginx
  tags:
    - install
    - packages
\`\`\`

### Error Handling
\`\`\`yaml
- name: Risky task
  command: /bin/risky-command
  ignore_errors: yes
  register: result
  failed_when: result.rc != 0 and "expected error" not in result.stderr
\`\`\`

## Useful Commands
\`\`\`bash
# List hosts
ansible-inventory --list

# Check connectivity
ansible all -m ping

# Gather facts
ansible hostname -m setup

# Run with tags
ansible-playbook --tags "install,config" playbook.yml

# Skip tags
ansible-playbook --skip-tags "slow" playbook.yml

# Limit hosts
ansible-playbook -l "webservers:!web3" playbook.yml
\`\`\`
`;

      return {
        content: [
          {
            type: "text",
            text: reference,
          },
        ],
      };
    }
  );
}
