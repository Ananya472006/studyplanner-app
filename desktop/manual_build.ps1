# StudyQuest Manual Desktop Packaging Script
# This script bypasses electron-builder/electron-packager permission bugs on Windows

$root = Resolve-Path (Join-Path $PSScriptRoot "..") | Select-Object -ExpandProperty Path
$desktop = "$root\desktop"
$frontend = "$root\frontend"
$outDir = "$desktop\dist\StudyQuest"

Write-Host "1. Cleaning output directory..."
Remove-Item -Recurse -Force $outDir -ErrorAction SilentlyContinue

Write-Host "2. Creating output directories..."
New-Item -ItemType Directory -Path "$outDir" -Force | Out-Null
New-Item -ItemType Directory -Path "$outDir\resources\app" -Force | Out-Null

Write-Host "3. Copying Electron template files from manual-extract..."
Copy-Item -Path "$desktop\dist\manual-extract\*" -Destination "$outDir" -Recurse -Force

Write-Host "4. Renaming executable to StudyQuest.exe..."
Rename-Item -Path "$outDir\electron.exe" -NewName "StudyQuest.exe" -ErrorAction SilentlyContinue

Write-Host "5. Copying application source files..."
# Copy desktop files
Copy-Item -Path "$desktop\main.js" -Destination "$outDir\resources\app\" -Force
Copy-Item -Path "$desktop\package.json" -Destination "$outDir\resources\app\" -Force

# Copy built frontend assets into app subfolder
Copy-Item -Path "$desktop\app" -Destination "$outDir\resources\app\" -Recurse -Force

# Create an empty node_modules folder inside resources/app to prevent any warnings
New-Item -ItemType Directory -Path "$outDir\resources\app\node_modules" -Force | Out-Null

Write-Host "6. Fixing index.html for Electron file:// compatibility..."
$indexPath = "$outDir\resources\app\app\index.html"
if (Test-Path $indexPath) {
    $html = Get-Content $indexPath -Raw -Encoding UTF8
    # Remove crossorigin attribute from script and link tags (causes ES module failure on file://)
    $html = $html -replace ' crossorigin="[^"]*"', ''
    $html = $html -replace ' crossorigin', ''
    Set-Content $indexPath $html -Encoding UTF8 -NoNewline
    Write-Host "   index.html patched OK."
} else {
    Write-Host "   WARNING: index.html not found at $indexPath"
}

Write-Host "---------------------------------------------"
Write-Host "Desktop packaging completed successfully!"
Write-Host "You can find your executable at:"
Write-Host "$outDir\StudyQuest.exe"
Write-Host "---------------------------------------------"
