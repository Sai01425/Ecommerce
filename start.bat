@echo off
title Novamart E-Commerce Platform Launcher
cd /d "%~dp0"

echo ========================================================
echo       Starting Novamart E-Commerce Platform
echo ========================================================

:: 1. Check & Start MySQL
echo [1/3] Checking MySQL database service...
"C:\xampp\mysql\bin\mysqladmin.exe" -u root ping >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Starting XAMPP MySQL server...
    start "" /b "C:\xampp\mysql\bin\mysqld.exe" --defaults-file="C:\xampp\mysql\bin\my.ini" --standalone
    timeout /t 3 /nobreak >nul
) else (
    echo MySQL is already running.
)

:: 2. Set Java 21 Environment
set "JAVA_HOME=C:\Users\khit\tools\jdk-21.0.12.1+1"
set "PATH=%JAVA_HOME%\bin;C:\Users\khit\tools\apache-maven-3.9.9\bin;%PATH%"

:: 3. Launch Spring Boot Application
echo [2/3] Launching Spring Boot Backend on http://localhost:8080 ...
start "" http://localhost:8080/login.html

java -jar "backend\target\ecommerce-backend-1.0.0.jar"

pause
