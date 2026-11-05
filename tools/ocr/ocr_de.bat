@echo off
rem OCR for German rulebooks (pol + eng). Drag one or more PDF files onto this file.
set "TESSDATA_PREFIX=D:\tessdata"

if "%~1"=="" (
  echo Drag one or more PDF files onto this file.
  pause
  exit /b 1
)

:next
if "%~1"=="" goto done
echo.
echo [OCR deu+eng] %~nx1
python -m ocrmypdf -l deu+eng --skip-text --output-type pdf --jobs 2 "%~1" "%~dpn1_OCR.pdf"
shift
goto next

:done
echo.
echo [DONE]
pause
