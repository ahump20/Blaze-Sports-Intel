#!/bin/bash

# Blaze Intelligence Monte Carlo Simulation Runner
# Austin Humphrey • Blaze Sports Intel

echo "=================================================="
echo "BLAZE INTELLIGENCE MONTE CARLO SIMULATION"
echo "BlazeSportsIntel.com"
echo "=================================================="

# Create output directory if it doesn't exist
mkdir -p results

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate 2>/dev/null || . venv/Scripts/activate 2>/dev/null
if [ $? -ne 0 ]; then
    echo "❌ ERROR: Failed to activate the virtual environment. Neither 'venv/bin/activate' nor 'venv/Scripts/activate' was found."
    echo "Please check that the virtual environment was created successfully."
    exit 1
fi

# Install/update dependencies
echo "Installing dependencies..."
pip install -q -r requirements.txt

# Run the simulation
echo "Running Monte Carlo simulation..."
echo ""
python monte_carlo.py

# Deactivate virtual environment
deactivate 2>/dev/null

echo ""
echo "✅ Simulation complete!"
echo "📁 Results saved to ./results/"
