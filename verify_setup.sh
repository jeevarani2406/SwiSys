#!/bin/bash

# SwiSys Setup Verification Script for macOS/Linux

echo ""
echo "========================================"
echo "  SwiSys Setup Verification"
echo "========================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 not installed"
    echo "Please install Python 3.12+ from https://www.python.org/downloads/"
    exit 1
fi

# Run the verification script
python3 verify_setup.py

exit $?
