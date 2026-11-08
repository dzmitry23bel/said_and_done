@echo off
rem Generates a random LIKE_SECRET and uploads it straight to the Worker.
rem The value is never printed or saved. Changing it later resets "one like per network"
rem (old voter codes no longer match), but existing counts stay.
cd /d "%~dp0"
powershell -NoProfile -Command "$b = New-Object byte[] 48; [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($b); [Convert]::ToBase64String($b)" | call node_modules\.bin\wrangler.cmd secret put LIKE_SECRET
