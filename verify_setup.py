#!/usr/bin/env python3
"""
SwiSys Setup Verification Script
Checks if all prerequisites and configurations are correct for running SwiSys locally
"""

import os
import sys
import subprocess
import json
from pathlib import Path

# Color codes for terminal output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

class SetupVerifier:
    def __init__(self):
        self.root_dir = Path(__file__).resolve().parent
        self.passed_checks = 0
        self.failed_checks = 0
        self.warnings = 0

    def print_section(self, title):
        print(f"\n{BLUE}{'='*60}")
        print(f"  {title}")
        print(f"{'='*60}{RESET}")

    def check_pass(self, message):
        print(f"{GREEN}✓ {message}{RESET}")
        self.passed_checks += 1

    def check_fail(self, message):
        print(f"{RED}✗ {message}{RESET}")
        self.failed_checks += 1

    def check_warn(self, message):
        print(f"{YELLOW}⚠ {message}{RESET}")
        self.warnings += 1

    def run_command(self, cmd, shell=False):
        """Run command and return output"""
        try:
            result = subprocess.run(
                cmd if shell else cmd.split(),
                capture_output=True,
                text=True,
                shell=shell
            )
            return result.returncode == 0, result.stdout.strip(), result.stderr.strip()
        except Exception as e:
            return False, "", str(e)

    def check_python(self):
        self.print_section("Python Environment Check")
        
        success, output, error = self.run_command("python --version")
        if success:
            self.check_pass(f"Python installed: {output}")
            # Check version
            try:
                version = output.split()[-1]
                major, minor = map(int, version.split('.')[:2])
                if major >= 3 and minor >= 12:
                    self.check_pass("Python 3.12+ requirement met")
                else:
                    self.check_warn(f"Python {major}.{minor} detected - recommend 3.12+")
            except:
                self.check_warn("Could not parse Python version")
        else:
            self.check_fail("Python not found - install Python 3.12+")

    def check_nodejs(self):
        self.print_section("Node.js Environment Check")
        
        success, output, error = self.run_command("node --version")
        if success:
            self.check_pass(f"Node.js installed: {output}")
        else:
            self.check_fail("Node.js not found - install Node.js 18+")
            return

        success, output, error = self.run_command("npm --version")
        if success:
            self.check_pass(f"npm installed: {output}")
        else:
            self.check_fail("npm not found")

    def check_git(self):
        self.print_section("Git Check")
        
        success, output, error = self.run_command("git --version")
        if success:
            self.check_pass(f"Git installed: {output}")
        else:
            self.check_fail("Git not found")

    def check_virtual_env(self):
        self.print_section("Backend Virtual Environment Check")
        
        venv_path = self.root_dir / ".venv"
        if venv_path.exists():
            self.check_pass(f"Virtual environment exists: {venv_path}")
        else:
            self.check_fail(f"Virtual environment not found: {venv_path}")
            self.check_warn("Run: python -m venv .venv")
            return False
        
        return True

    def check_backend_dependencies(self):
        self.print_section("Backend Dependencies Check")
        
        requirements_path = self.root_dir / "backend" / "requirements.txt"
        if not requirements_path.exists():
            self.check_fail(f"requirements.txt not found: {requirements_path}")
            return

        with open(requirements_path) as f:
            requirements = f.read()
        
        essential_packages = ["Django", "djangorestframework", "mysqlclient"]
        for package in essential_packages:
            if package.lower() in requirements.lower():
                self.check_pass(f"Package requirement found: {package}")
            else:
                self.check_warn(f"Package requirement not found: {package}")

    def check_backend_config(self):
        self.print_section("Backend Configuration Check")
        
        env_path = self.root_dir / "backend" / ".env"
        if env_path.exists():
            self.check_pass(f".env file exists: {env_path}")
        else:
            self.check_fail(f".env file not found: {env_path}")
            self.check_warn("Copy from .env.example and configure")
            return

        env_example_path = self.root_dir / "backend" / ".env.example"
        if env_example_path.exists():
            self.check_pass(f".env.example file exists: {env_example_path}")
        else:
            self.check_warn(f".env.example file not found: {env_example_path}")

    def check_backend_migrations(self):
        self.print_section("Backend Migrations Check")
        
        migrations_paths = [
            "backend/accounts/migrations/__init__.py",
            "backend/Main/migrations/__init__.py",
        ]
        
        for migration_file in migrations_paths:
            path = self.root_dir / migration_file
            if path.exists():
                self.check_pass(f"Migration file exists: {migration_file}")
            else:
                self.check_fail(f"Migration file missing: {migration_file}")

    def check_frontend_dependencies(self):
        self.print_section("Frontend Dependencies Check")
        
        package_json_path = self.root_dir / "frontend" / "package.json"
        if not package_json_path.exists():
            self.check_fail(f"package.json not found: {package_json_path}")
            return

        try:
            with open(package_json_path) as f:
                package_data = json.load(f)
            
            dependencies = package_data.get("dependencies", {})
            essential_deps = ["next", "react", "axios"]
            
            for dep in essential_deps:
                if dep in dependencies:
                    self.check_pass(f"Dependency found: {dep} {dependencies[dep]}")
                else:
                    self.check_warn(f"Dependency not found: {dep}")
        except Exception as e:
            self.check_fail(f"Error reading package.json: {e}")

    def check_frontend_node_modules(self):
        self.print_section("Frontend Node Modules Check")
        
        node_modules = self.root_dir / "frontend" / "node_modules"
        if node_modules.exists():
            self.check_pass(f"node_modules installed: {node_modules}")
        else:
            self.check_warn(f"node_modules not found: {node_modules}")
            self.check_warn("Run: cd frontend && npm install")

    def check_frontend_config(self):
        self.print_section("Frontend Configuration Check")
        
        env_path = self.root_dir / "frontend" / ".env.local"
        if env_path.exists():
            self.check_pass(f".env.local file exists: {env_path}")
            try:
                with open(env_path) as f:
                    env_content = f.read()
                if "NEXT_PUBLIC_API_URL" in env_content:
                    self.check_pass("NEXT_PUBLIC_API_URL configured")
                else:
                    self.check_warn("NEXT_PUBLIC_API_URL not configured")
            except Exception as e:
                self.check_fail(f"Error reading .env.local: {e}")
        else:
            self.check_fail(f".env.local not found: {env_path}")
            self.check_warn("Run: cd frontend && cp .env.example .env.local")

    def check_gitignore(self):
        self.print_section("Git Configuration Check")
        
        gitignore_path = self.root_dir / ".gitignore"
        if gitignore_path.exists():
            self.check_pass(f".gitignore exists: {gitignore_path}")
            
            with open(gitignore_path) as f:
                gitignore_content = f.read()
            
            critical_ignores = [".env", "db.sqlite3", ".venv", "node_modules", ".next"]
            for ignore_pattern in critical_ignores:
                if ignore_pattern in gitignore_content:
                    self.check_pass(f"Ignored: {ignore_pattern}")
                else:
                    self.check_warn(f"Not ignored: {ignore_pattern}")
        else:
            self.check_fail(f".gitignore not found: {gitignore_path}")

    def check_project_structure(self):
        self.print_section("Project Structure Check")
        
        required_dirs = [
            "backend",
            "frontend",
            "backend/accounts",
            "backend/Main",
            "backend/SwiSysBackend",
            "frontend/src",
            "frontend/public",
        ]
        
        for dir_path in required_dirs:
            full_path = self.root_dir / dir_path
            if full_path.exists():
                self.check_pass(f"Directory exists: {dir_path}")
            else:
                self.check_fail(f"Directory missing: {dir_path}")

    def print_summary(self):
        self.print_section("Verification Summary")
        
        total = self.passed_checks + self.failed_checks + self.warnings
        print(f"\n{GREEN}Passed: {self.passed_checks}{RESET}")
        print(f"{RED}Failed: {self.failed_checks}{RESET}")
        print(f"{YELLOW}Warnings: {self.warnings}{RESET}")
        print(f"Total: {total}")
        
        if self.failed_checks == 0:
            print(f"\n{GREEN}✓ All critical checks passed!{RESET}")
            if self.warnings > 0:
                print(f"{YELLOW}Note: {self.warnings} warning(s) to review{RESET}")
        else:
            print(f"\n{RED}✗ {self.failed_checks} critical issue(s) found{RESET}")

    def print_next_steps(self):
        self.print_section("Next Steps")
        
        print("""
1. Ensure all prerequisites are installed (Python 3.12+, Node.js 18+, Git)

2. Setup Backend:
   $ python -m venv .venv
   $ .\.venv\Scripts\Activate.ps1  # Windows
   $ cd backend
   $ pip install -r requirements.txt
   $ python manage.py migrate
   $ python manage.py createsuperuser
   $ python manage.py runserver

3. Setup Frontend (in new terminal):
   $ cd frontend
   $ npm install
   $ npm run dev

4. Access the application:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:8000/api
   - Admin: http://localhost:8000/admin

5. For more details, see SETUP.md
        """)

    def run(self):
        print(f"{BLUE}")
        print("╔═══════════════════════════════════════╗")
        print("║   SwiSys Setup Verification Tool      ║")
        print("║   Version 1.0.0                       ║")
        print("╚═══════════════════════════════════════╝")
        print(f"{RESET}")
        
        self.check_python()
        self.check_nodejs()
        self.check_git()
        self.check_virtual_env()
        self.check_backend_dependencies()
        self.check_backend_config()
        self.check_backend_migrations()
        self.check_frontend_dependencies()
        self.check_frontend_node_modules()
        self.check_frontend_config()
        self.check_gitignore()
        self.check_project_structure()
        
        self.print_summary()
        self.print_next_steps()
        
        return self.failed_checks == 0

if __name__ == "__main__":
    verifier = SetupVerifier()
    success = verifier.run()
    sys.exit(0 if success else 1)
