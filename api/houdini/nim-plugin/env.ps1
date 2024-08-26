# Check if Python 3.11 is available
$python = Get-Command python3.11 -ErrorAction SilentlyContinue
if (-Not $python) {
    Write-Error "Python 3.11 is not installed. Please install Python 3.11 to continue."
    exit 1
}

# Create a virtual environment if it doesn't exist
if (-Not (Test-Path -Path ".\.nim" -PathType Container)) {
    & $python -m venv .\.nim
}

# Activate the virtual environment
& .\.nim\Scripts\Activate.ps1

# Install the required packages
pip install -r requirements.txt

# Deactivate the virtual environment
deactivate