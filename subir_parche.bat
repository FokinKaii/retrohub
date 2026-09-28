@echo off
title RetroHub - Subir Parche a GitHub Pages
color 0b
echo ===================================================
echo       RETROHUB - SUBIR PARCHE A GITHUB PAGES
echo ===================================================
echo.

set "PATH=C:\Users\AluTarde\AppData\Local\Programs\Git\cmd;C:\Users\AluTarde\AppData\Local\Programs\gh;%PATH%"

echo 1. Actualizando catalogo de juegos (ROMS)...
python "%~dp0actualizar_catalogo.py"

echo.
echo 2. Preparando archivos modificados...
git -C "%~dp0" add .

echo.
set /p msg="Escribe el mensaje del parche (o pulsa ENTER para 'Actualizacion'): "
if "%msg%"=="" set msg=Actualizacion y mejoras

echo.
echo 3. Guardando cambios...
git -C "%~dp0" commit -m "%msg%"

echo.
echo 4. Subiendo a GitHub...
git -C "%~dp0" push origin main

echo.
echo ===================================================
echo   LISTO! Parche subido con exito.
echo   La web se actualizara en ~1 minuto para todos en:
echo   https://fokinkaii.github.io/retrohub/
echo ===================================================
echo.
pause
