#!/usr/bin/env python
"""
Quick test status checker for Swisys backend.

This script provides a quick overview of test coverage and can be used
to verify that the test environment is properly set up.

Usage:
    python check_tests.py                 # Check test environment
    python check_tests.py --count         # Count tests in each module
    python check_tests.py --run-quick     # Run a quick smoke test
"""

import os
import sys
import importlib.util
import subprocess
import glob
from pathlib import Path

class TestChecker:
    def __init__(self):
        self.backend_dir = Path("d:/Titan/Projects/Swisys/backend")
        self.tests_dir = self.backend_dir / "tests"
        self.python_path = "D:/Titan/Projects/Swisys/.venv/Scripts/python.exe"
    
    def check_environment(self):
        """Check if test environment is properly set up."""
        print("🔍 Checking Swisys Backend Test Environment")
        print("=" * 50)
        
        # Check directories
        print(f"📁 Backend directory: {self.backend_dir}")
        print(f"   Exists: {'✅' if self.backend_dir.exists() else '❌'}")
        
        print(f"📁 Tests directory: {self.tests_dir}")
        print(f"   Exists: {'✅' if self.tests_dir.exists() else '❌'}")
        
        # Check Python environment
        print(f"🐍 Python executable: {self.python_path}")
        try:
            result = subprocess.run([self.python_path, "--version"], 
                                  capture_output=True, text=True)
            if result.returncode == 0:
                print(f"   Version: ✅ {result.stdout.strip()}")
            else:
                print("   Version: ❌ Failed to get version")
        except Exception as e:
            print(f"   Version: ❌ {e}")
        
        # Check Django
        try:
            result = subprocess.run([self.python_path, "-c", "import django; print(django.get_version())"],
                                  cwd=self.backend_dir, capture_output=True, text=True)
            if result.returncode == 0:
                print(f"📦 Django: ✅ {result.stdout.strip()}")
            else:
                print(f"📦 Django: ❌ Not available")
        except Exception as e:
            print(f"📦 Django: ❌ {e}")
        
        # Check test files
        test_files = list(self.tests_dir.glob("test_*.py"))
        print(f"\n📋 Test Files Found: {len(test_files)}")
        for test_file in sorted(test_files):
            print(f"   📄 {test_file.name}")
        
        return len(test_files) > 0
    
    def count_tests(self):
        """Count tests in each module."""
        print("\n📊 Test Count Summary")
        print("=" * 50)
        
        test_files = list(self.tests_dir.glob("test_*.py"))
        total_tests = 0
        
        for test_file in sorted(test_files):
            try:
                with open(test_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Count test methods (def test_)
                test_methods = content.count('def test_')
                test_classes = content.count('class ')
                
                print(f"📄 {test_file.name}")
                print(f"   Classes: {test_classes}")
                print(f"   Methods: {test_methods}")
                
                total_tests += test_methods
                
            except Exception as e:
                print(f"📄 {test_file.name} - Error: {e}")
        
        print(f"\n📈 Total Test Methods: {total_tests}")
        return total_tests
    
    def run_quick_test(self):
        """Run a quick smoke test to verify everything works."""
        print("\n🚀 Running Quick Smoke Test")
        print("=" * 50)
        
        # Try to run a simple model test
        cmd = [
            self.python_path,
            "manage.py",
            "test",
            "tests.test_models.UserModelTest.test_create_admin_user",
            "-v", "1"
        ]
        
        try:
            result = subprocess.run(
                cmd,
                cwd=self.backend_dir,
                capture_output=True,
                text=True,
                timeout=60
            )
            
            if result.returncode == 0:
                print("✅ Quick test PASSED - Test environment is working!")
                return True
            else:
                print("❌ Quick test FAILED")
                print("STDERR:", result.stderr)
                print("STDOUT:", result.stdout)
                return False
                
        except subprocess.TimeoutExpired:
            print("❌ Quick test TIMEOUT")
            return False
        except Exception as e:
            print(f"❌ Quick test ERROR: {e}")
            return False
    
    def get_test_coverage_info(self):
        """Get information about test coverage areas."""
        print("\n🎯 Test Coverage Areas")
        print("=" * 50)
        
        coverage_areas = {
            "test_models.py": [
                "User model with bilingual names",
                "Product CRUD operations",
                "LoginLog tracking",
                "ProductUpdateLog changes",
                "EmailOTP verification"
            ],
            "test_api.py": [
                "Unified login API",
                "Product management API",
                "User registration API",
                "Role-based access control"
            ],
            "test_permissions.py": [
                "Admin permissions",
                "Employee product access",
                "Customer read-only access",
                "Permission combinations"
            ],
            "test_serializers.py": [
                "User registration serialization",
                "Login data validation",
                "Product data serialization",
                "OTP data handling"
            ]
        }
        
        for filename, areas in coverage_areas.items():
            file_path = self.tests_dir / filename
            exists = "✅" if file_path.exists() else "❌"
            print(f"{exists} {filename}")
            for area in areas:
                print(f"    • {area}")
            print()


def main():
    """Main entry point."""
    import argparse
    
    parser = argparse.ArgumentParser(description="Swisys Test Environment Checker")
    parser.add_argument('--count', action='store_true', help="Count tests in each module")
    parser.add_argument('--run-quick', action='store_true', help="Run a quick smoke test")
    parser.add_argument('--coverage', action='store_true', help="Show test coverage info")
    
    args = parser.parse_args()
    
    checker = TestChecker()
    
    # Always check environment first
    env_ok = checker.check_environment()
    
    if args.count:
        checker.count_tests()
    
    if args.coverage:
        checker.get_test_coverage_info()
    
    if args.run_quick:
        if env_ok:
            test_ok = checker.run_quick_test()
            sys.exit(0 if test_ok else 1)
        else:
            print("❌ Environment check failed, skipping quick test")
            sys.exit(1)
    
    # If no specific action requested, show summary
    if not any([args.count, args.run_quick, args.coverage]):
        checker.count_tests()
        checker.get_test_coverage_info()
        
        if env_ok:
            print("\n💡 Next steps:")
            print("   python check_tests.py --run-quick    # Run smoke test")
            print("   python test_runner.py                # Run all tests")
            print("   python test_runner.py --suite models # Run specific suite")


if __name__ == "__main__":
    main()
