$ErrorActionPreference = "Stop"

$page = Invoke-RestMethod -Uri "http://127.0.0.1:9336/json/list" |
  Where-Object { $_.type -eq "page" -and $_.url -like "http://localhost:4173/*" } |
  Select-Object -First 1
if (-not $page) { throw "Avatar page not found" }

$socket = [System.Net.WebSockets.ClientWebSocket]::new()
$cancellation = [System.Threading.CancellationToken]::None
$socket.ConnectAsync([Uri]$page.webSocketDebuggerUrl, $cancellation).GetAwaiter().GetResult() | Out-Null
$script:nextId = 0

function Send-Cdp {
  param([string]$Method, [hashtable]$Params = @{})
  $script:nextId += 1
  $commandId = $script:nextId
  $payload = @{ id = $commandId; method = $Method; params = $Params } | ConvertTo-Json -Compress -Depth 12
  $bytes = [Text.Encoding]::UTF8.GetBytes($payload)
  $socket.SendAsync([ArraySegment[byte]]::new($bytes), [System.Net.WebSockets.WebSocketMessageType]::Text, $true, $cancellation).GetAwaiter().GetResult() | Out-Null

  while ($true) {
    $builder = [Text.StringBuilder]::new()
    do {
      $buffer = New-Object byte[] 1048576
      $received = $socket.ReceiveAsync([ArraySegment[byte]]::new($buffer), $cancellation).GetAwaiter().GetResult()
      [void]$builder.Append([Text.Encoding]::UTF8.GetString($buffer, 0, $received.Count))
    } while (-not $received.EndOfMessage)
    $message = $builder.ToString() | ConvertFrom-Json
    if ($message.id -eq $commandId) { return $message }
  }
}

[void](Send-Cdp "Page.enable")
[void](Send-Cdp "Emulation.setDeviceMetricsOverride" @{ width = 1440; height = 1000; deviceScaleFactor = 1; mobile = $false })
Start-Sleep -Seconds 6

$positions = @(
  @{ Name = "before"; Ratio = 0.9 },
  @{ Name = "full"; Ratio = 1.0 },
  @{ Name = "reverse"; Ratio = 0.9 }
)
foreach ($position in $positions) {
  $expression = @"
const about = document.querySelector('#about');
const distance = about.offsetHeight - innerHeight;
window.scrollTo(0, about.offsetTop + distance * $($position.Ratio));
({ scrollY, top: about.offsetTop, height: about.offsetHeight });
"@
  [void](Send-Cdp "Runtime.evaluate" @{ expression = $expression; returnByValue = $true })
  Start-Sleep -Seconds 3
  $capture = Send-Cdp "Page.captureScreenshot" @{ format = "png"; fromSurface = $true; captureBeyondViewport = $false }
  [IO.File]::WriteAllBytes(
    "D:\project\search\github_io_st\.avatar-progress-$($position.Name).png",
    [Convert]::FromBase64String($capture.result.data)
  )
}

$socket.CloseAsync([System.Net.WebSockets.WebSocketCloseStatus]::NormalClosure, "done", $cancellation).GetAwaiter().GetResult() | Out-Null
