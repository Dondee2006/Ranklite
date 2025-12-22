# PowerShell script to properly format the REQUESTY_API_KEY
$envPath = ".env.local"

# Read all content
$lines = Get-Content $envPath

# Find and fix the REQUESTY_API_KEY
$newLines = @()
$skipNext = $false
$foundKey = $false

for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($skipNext) {
        $skipNext = $false
        continue
    }
    
    $line = $lines[$i]
    
    if ($line -match "^REQUESTY_API_KEY=") {
        # Combine this line with any continuation
        $fullKey = $line
        $j = $i + 1
        while ($j -lt $lines.Count -and $lines[$j] -notmatch "^[A-Z_]+=") {
            $fullKey += $lines[$j].Trim()
            $j++
        }
        # Clean up the key - remove any whitespace/newlines
        $fullKey = $fullKey -replace '\s+', ''
        $newLines += $fullKey
        $foundKey = $true
        # Skip the continuation lines
        $i = $j - 1
    } else {
        $newLines += $line
    }
}

# Write back
$newLines | Set-Content $envPath

if ($foundKey) {
    Write-Host "✓ Fixed REQUESTY_API_KEY formatting"
    Write-Host ""
    Write-Host "Please verify your API key is correct by:"
    Write-Host "1. Logging into your Requesty dashboard"
    Write-Host "2. Checking that the API key matches what''s in .env.local"
    Write-Host "3. Ensuring the key is active and has the correct permissions"
} else {
    Write-Host "⚠ REQUESTY_API_KEY not found in .env.local"
}
