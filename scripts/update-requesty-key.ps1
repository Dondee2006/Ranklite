# Update .env.local with correct REQUESTY_API_KEY
$envPath = ".env.local"
$newKey = "rqsty-sk-fVztxJJqRZqenrA9RJjvBxNYiq8myfuuMufFS0szzot/b8/2l14p8FJRaHZZfLAIyqz1cX+lgBvKF3bKuQuB3ZBZ7u8Pq2bPO5+bh3tzDwM="

# Read the file
$content = Get-Content $envPath -Raw

# Replace or add REQUESTY_API_KEY
if ($content -match "REQUESTY_API_KEY=") {
    $content = $content -replace "REQUESTY_API_KEY=.*?(\r?\n|$)", "REQUESTY_API_KEY=$newKey`r`n"
} else {
    $content += "`r`nREQUESTY_API_KEY=$newKey`r`n"
}

# Write back
Set-Content $envPath -Value $content -NoNewline

Write-Host "Updated REQUESTY_API_KEY in .env.local"
