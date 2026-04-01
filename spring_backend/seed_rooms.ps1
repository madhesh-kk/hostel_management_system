# Seed 63 rooms via REST API
$login = Invoke-RestMethod -Uri "http://localhost:8081/api/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"adminhostel@gmail.com","password":"passhostel"}'
$token = $login.token
$headers = @{ Authorization = "Bearer $token"; "Content-Type" = "application/json" }
$count = 0

# Floor 1: rooms 100-120
foreach ($r in 100..120) {
    $body = '{"roomNumber":"' + $r + '","capacity":2,"floor":1,"roomType":"standard","status":"available"}'
    try {
        Invoke-RestMethod -Uri "http://localhost:8081/api/rooms" -Method POST -Headers $headers -Body $body | Out-Null
        $count++
        Write-Host "Added room $r (Floor 1)"
    } catch {
        Write-Host "SKIP room $r - $($_.Exception.Message)"
    }
}

# Floor 2: rooms 200-220
foreach ($r in 200..220) {
    $body = '{"roomNumber":"' + $r + '","capacity":2,"floor":2,"roomType":"standard","status":"available"}'
    try {
        Invoke-RestMethod -Uri "http://localhost:8081/api/rooms" -Method POST -Headers $headers -Body $body | Out-Null
        $count++
        Write-Host "Added room $r (Floor 2)"
    } catch {
        Write-Host "SKIP room $r - $($_.Exception.Message)"
    }
}

# Floor 3: rooms 300-320
foreach ($r in 300..320) {
    $body = '{"roomNumber":"' + $r + '","capacity":2,"floor":3,"roomType":"standard","status":"available"}'
    try {
        Invoke-RestMethod -Uri "http://localhost:8081/api/rooms" -Method POST -Headers $headers -Body $body | Out-Null
        $count++
        Write-Host "Added room $r (Floor 3)"
    } catch {
        Write-Host "SKIP room $r - $($_.Exception.Message)"
    }
}

Write-Host "`nDone! Inserted $count rooms total."
