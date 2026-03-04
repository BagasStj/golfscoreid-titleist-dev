@echo off
echo Opening Windows Firewall for Vite Dev Server (Port 5173)...
netsh advfirewall firewall add rule name="Vite Dev Server" dir=in action=allow protocol=TCP localport=5173
echo Done! Firewall rule added.
pause
