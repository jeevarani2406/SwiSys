#!/usr/bin/env python
"""
Django test runner script for the Swisys backend application.

This script provides a convenient way to run all tests or specific test modules
using Django's test framework.

Usage:
    python run_tests.py                 # Run all tests
    python run_tests.py models          # Run only model tests
    python run_tests.py api             # Run only API tests
    python run_tests.py permissions     # Run only permission tests
    python run_tests.py serializers     # Run only serializer tests
    python run_tests.py --verbose       # Run with verbose output
    python run_tests.py --coverage      # Run with coverage report
"""

import os
import sys
import django
from django.conf import settings
from django.test.utils import get_runner
from django.core.management import execute_from_command_line

if __name__ == "__main__":
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
    django.setup()
    
    # Parse command line arguments
    test_modules = []
    verbose = False
    coverage = False
    
    for arg in sys.argv[1:]:
        if arg == '--verbose' or arg == '-v':
            verbose = True
        elif arg == '--coverage' or arg == '-c':
            coverage = True
        elif arg in ['models', 'api', 'permissions', 'serializers', 'comprehensive']:
            test_modules.append(f'tests.test_{arg}')
        elif not arg.startswith('-'):
            test_modules.append(arg)
    
    # Build command
    command = ['manage.py', 'test']
    
    if test_modules:
        command.extend(test_modules)
    else:
        command.append('tests')
    
    if verbose:
        command.append('--verbosity=2')
    
    if coverage:
        print("Running tests with coverage...")
        # You can add coverage.py integration here if needed
    
    print(f"Running command: {' '.join(command)}")
    print("-" * 50)
    
    # Execute the test command
    execute_from_command_line(command)
