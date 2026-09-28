@echo off
title Servidor EmulatorJS
cd /d "%~dp0"
echo ===================================================
echo     Iniciando Servidor Local para EmulatorJS...
echo ===================================================
echo.
python server.py
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] No se pudo iniciar con Python. Comprueba que Python este instalado.
    pause
)
