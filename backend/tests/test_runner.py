#!/usr/bin/env python
"""
Comprehensive test runner for Swisys backend application.

This script runs all test suites and provides a summary of results.
It can be used for continuous integration and development testing.

Usage:
    python test_runner.py                    # Run all tests
    python test_runner.py --suite models     # Run specific test suite
    python test_runner.py --verbose          # Verbose output
    python test_runner.py --fast             # Skip slow integration tests
"""

import os
import sys
import subprocess
import time
from datetime import datetime

# Test suite mapping
TEST_SUITES = {
    'models': 'tests.test_models',
    'api': 'tests.test_api', 
    'permissions': 'tests.test_permissions',
    'serializers': 'tests.test_serializers',
    'comprehensive': 'tests.test_comprehensive',
    'all': 'tests'
}

class TestRunner:
    def __init__(self, python_path="D:/Titan/Projects/Swisys/.venv/Scripts/python.exe"):
        self.python_path = python_path
        self.backend_dir = "d:\\Titan\\Projects\\Swisys\\backend"
        self.results = {}
        
    def run_test_suite(self, suite_name, test_path, verbose=False):
        """Run a specific test suite and return results."""
        print(f"\n{'='*60}")
        print(f"Running {suite_name.upper()} Tests")
        print(f"{'='*60}")
        
        start_time = time.time()
        
        cmd = [
            self.python_path,
            "manage.py",
            "test",
            test_path
        ]
        
        if verbose:
            cmd.append("-v")
            cmd.append("2")
        
        try:
            result = subprocess.run(
                cmd,
                cwd=self.backend_dir,
                capture_output=True,
                text=True,
                timeout=300  # 5 minute timeout
            )
            
            end_time = time.time()
            duration = end_time - start_time
            
            success = result.returncode == 0
            
            self.results[suite_name] = {
                'success': success,
                'duration': duration,
                'output': result.stdout,
                'errors': result.stderr
            }
            
            # Print summary
            status = "✅ PASSED" if success else "❌ FAILED"
            print(f"{status} - Duration: {duration:.2f}s")
            
            if not success:
                print("\nERROR OUTPUT:")
                print(result.stderr)
                print("\nSTDOUT:")
                print(result.stdout)
            elif verbose:
                print("\nOUTPUT:")
                print(result.stdout)
                
            return success
            
        except subprocess.TimeoutExpired:
            print("❌ TIMEOUT - Test suite took too long")
            self.results[suite_name] = {
                'success': False,
                'duration': 300,
                'output': '',
                'errors': 'Test suite timeout'
            }
            return False
        except Exception as e:
            print(f"❌ ERROR - {str(e)}")
            self.results[suite_name] = {
                'success': False,
                'duration': 0,
                'output': '',
                'errors': str(e)
            }
            return False
    
    def run_all_tests(self, specific_suite=None, verbose=False, fast=False):
        """Run all test suites or a specific one."""
        print(f"🚀 Starting Swisys Backend Test Suite")
        print(f"📅 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"🐍 Python: {self.python_path}")
        print(f"📁 Backend: {self.backend_dir}")
        
        if specific_suite:
            if specific_suite not in TEST_SUITES:
                print(f"❌ Unknown test suite: {specific_suite}")
                print(f"Available suites: {', '.join(TEST_SUITES.keys())}")
                return False
            
            suites_to_run = {specific_suite: TEST_SUITES[specific_suite]}
        else:
            suites_to_run = TEST_SUITES.copy()
            if fast:
                # Remove slow integration tests
                suites_to_run.pop('comprehensive', None)
        
        total_start = time.time()
        all_passed = True
        
        for suite_name, test_path in suites_to_run.items():
            if suite_name == 'all':
                continue  # Skip 'all' when running individual suites
                
            success = self.run_test_suite(suite_name, test_path, verbose)
            if not success:
                all_passed = False
        
        total_duration = time.time() - total_start
        
        # Print final summary
        self.print_summary(total_duration, all_passed)
        
        return all_passed
    
    def print_summary(self, total_duration, all_passed):
        """Print test execution summary."""
        print(f"\n{'='*80}")
        print("📊 TEST EXECUTION SUMMARY")
        print(f"{'='*80}")
        
        passed_count = sum(1 for r in self.results.values() if r['success'])
        total_count = len(self.results)
        
        print(f"📈 Overall Status: {'✅ ALL PASSED' if all_passed else '❌ SOME FAILED'}")
        print(f"📊 Tests Passed: {passed_count}/{total_count}")
        print(f"⏱️  Total Duration: {total_duration:.2f}s")
        print()
        
        # Individual suite results
        for suite_name, result in self.results.items():
            status = "✅" if result['success'] else "❌"
            print(f"{status} {suite_name.ljust(15)} - {result['duration']:.2f}s")
        
        print(f"\n{'='*80}")
        
        if all_passed:
            print("🎉 All tests passed! Ready for deployment.")
        else:
            print("🔥 Some tests failed. Please check the output above.")
            print("💡 Tips:")
            print("   - Run specific suite: python test_runner.py --suite models")
            print("   - Verbose output: python test_runner.py --verbose")
            print("   - Check test documentation in tests/README.md")


def main():
    """Main entry point for test runner."""
    import argparse
    
    parser = argparse.ArgumentParser(description="Swisys Backend Test Runner")
    parser.add_argument('--suite', choices=list(TEST_SUITES.keys()), 
                       help="Run specific test suite")
    parser.add_argument('--verbose', '-v', action='store_true',
                       help="Verbose output")
    parser.add_argument('--fast', '-f', action='store_true',
                       help="Skip slow integration tests")
    parser.add_argument('--python', default="D:/Titan/Projects/Swisys/.venv/Scripts/python.exe",
                       help="Python executable path")
    
    args = parser.parse_args()
    
    runner = TestRunner(python_path=args.python)
    success = runner.run_all_tests(
        specific_suite=args.suite,
        verbose=args.verbose,
        fast=args.fast
    )
    
    # Exit with appropriate code for CI/CD
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
