@echo off
REM Quick Start Script for Playwright Costing Tests (Windows)

setlocal enabledelayedexpansion

echo.
echo ===============================================================
echo Playwright Costing Test Suite - Quick Start (Windows)
echo ===============================================================
echo.

REM Check if node_modules exists
if not exist "node_modules" (
  echo Installing dependencies...
  call npm install
)

REM Create necessary directories
if not exist "screenshots" mkdir screenshots
if not exist "test-results" mkdir test-results

echo.
echo [*] Available Commands:
echo.
echo [1] Run all costing tests:
echo     npx playwright test costing-unified.spec.ts --headed
echo.
echo [2] Run smoke tests only:
echo     npx playwright test costing-unified.spec.ts --grep "@smoke" --headed
echo.
echo [3] Run regression tests:
echo     npx playwright test costing-unified.spec.ts --grep "@regression" --headed
echo.
echo [4] Run MIG Welding tests:
echo     npx playwright test costing-unified.spec.ts --grep "MIG Welding" --headed
echo.
echo [5] Run Sheet Metal tests:
echo     npx playwright test costing-unified.spec.ts --grep "Sheet Metal" --headed
echo.
echo [6] Run with debug mode:
echo     npx playwright test costing-unified.spec.ts --headed --debug
echo.
echo [7] Generate HTML report:
echo     npx playwright show-report
echo.
echo [8] View test results JSON:
echo     type test-results\costing-report.json
echo.
echo [9] Run all tests (costing_ + costing-unified):
echo     npx playwright test "**/costing*.spec.ts" --headed
echo.
echo ===============================================================
echo For detailed documentation, see: tests\COSTING_TEST_GUIDE.md
echo ===============================================================
echo.

REM Optional: Run smoke tests if --smoke flag provided
if "%1"=="--smoke" (
  echo Running smoke tests...
  call npx playwright test costing-unified.spec.ts --grep "@smoke" --headed
  goto :eof
)

REM Optional: Run full suite if --full flag provided
if "%1"=="--full" (
  echo Running full test suite...
  call npx playwright test costing-unified.spec.ts --headed
  goto :eof
)

echo.
echo Ready to run tests! Choose a command from above.
echo.
