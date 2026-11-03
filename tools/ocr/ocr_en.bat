@echo off
rem Drag one or more PDF files onto this file to make a searchable "_OCR.pdf" next to each original.
rem Language: English. The original PDF is never overwritten.
set TESSDATA_PREFIX=D:\tessdata
if "%~1"=="" (
  echo Drag a PDF onto this file.
  pause
  exit /b
)
:loop
if "%~1"=="" goto done
echo.
echo Processing: %~1
python -m ocrmypdf -l eng --skip-text --output-type pdf --jobs 2 "%~1" "%~dpn1_OCR.pdf"
if errorlevel 1 (
  echo [FAILED] %~1
) else (
  echo [DONE] %~dpn1_OCR.pdf
)
shift
goto loop
:done
echo.
echo All finished. Press any key to close.
pause
