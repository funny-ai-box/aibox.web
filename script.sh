#!/bin/bash

# Create apps directory
mkdir -p src/apps



# Create 24 app directories and components
for i in {1..24}
do
  mkdir -p src/apps/App$i
  
  # Copy the template and update the component name
  sed "s/App1/App$i/g" App1.jsx > src/apps/App$i/App$i.jsx
  sed -i "s/待开发1/待开发$i/g" src/apps/App$i/App$i.jsx
done

echo "Project structure created successfully!"