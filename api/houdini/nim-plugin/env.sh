#!/usr/bin/env bash

# Check if Python 3.11 is available
if ! command -v python3.11 &> /dev/null; then
    echo "Python 3.11 is not installed. Please install Python 3.11 to continue."
    exit 1
fi

# Create a virtual environment if it doesn't exist
if [[ ! -d .nim ]]; then
    python3.11 -m venv .nim
fi

# Activate the virtual environment
source .nim/bin/activate

# Install the required packages
pip install -r requirements.txt

# Deactivate the virtual environment
deactivate