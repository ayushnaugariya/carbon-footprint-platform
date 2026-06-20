# git-watch.ps1
# Background file watcher to automatically commit and push changes to GitHub on save.

$path = Get-Location
Write-Host "Starting Git Auto-Sync Watcher in $path..." -ForegroundColor Green

$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = $path
$watcher.IncludeSubdirectories = $true
$watcher.EnableRaisingEvents = $true

# Debounce tracker to prevent multiple rapid commits for a single save
$lastRun = [DateTime]::MinValue

$action = {
    $filePath = $Event.SourceEventArgs.FullPath
    $changeType = $Event.SourceEventArgs.ChangeType
    
    # Ignore non-project folders and build output
    if ($filePath -match '\\\.git\\' -or $filePath -match '\\node_modules\\' -or $filePath -match '\\dist\\' -or $filePath -match '\\\.github\\') {
        return
    }
    
    # Simple 2-second debounce
    if ((Get-Date) -subtract $lastRun -lt [TimeSpan]::FromSeconds(2)) {
        return
    }
    $global:lastRun = Get-Date

    Write-Host "File changed: $filePath ($changeType). Syncing to GitHub..." -ForegroundColor Cyan
    
    # Run git sync commands
    git add .
    git commit -m "Auto-sync: update at $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    git push origin master
    
    Write-Host "Sync completed successfully!" -ForegroundColor Green
}

# Register file event handlers
$changedEvent = Register-ObjectEvent $watcher "Changed" -Action $action
$createdEvent = Register-ObjectEvent $watcher "Created" -Action $action
$deletedEvent = Register-ObjectEvent $watcher "Deleted" -Action $action

Write-Host "Watching for changes... (Press Ctrl+C to stop the watcher)" -ForegroundColor Yellow

try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
}
finally {
    # Cleanup events on script termination
    Write-Host "Cleaning up watcher events..." -ForegroundColor Red
    Unregister-Event -SourceIdentifier $changedEvent.Name
    Unregister-Event -SourceIdentifier $createdEvent.Name
    Unregister-Event -SourceIdentifier $deletedEvent.Name
    $watcher.Dispose()
}
