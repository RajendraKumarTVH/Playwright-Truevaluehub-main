#!/usr/bin/env bash
# Quick Start Script for Playwright Costing Tests

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}Playwright Costing Test Suite - Quick Start${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}\n"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}Installing dependencies...${NC}"
  npm install
fi

# Create necessary directories
mkdir -p screenshots test-results

echo -e "\n${GREEN}✅ Available Commands:${NC}\n"

echo -e "${YELLOW}1. Run all costing tests:${NC}"
echo "   npx playwright test costing-unified.spec.ts --headed\n"

echo -e "${YELLOW}2. Run smoke tests only:${NC}"
echo "   npx playwright test costing-unified.spec.ts --grep '@smoke' --headed\n"

echo -e "${YELLOW}3. Run regression tests:${NC}"
echo "   npx playwright test costing-unified.spec.ts --grep '@regression' --headed\n"

echo -e "${YELLOW}4. Run MIG Welding tests:${NC}"
echo "   npx playwright test costing-unified.spec.ts --grep 'MIG Welding' --headed\n"

echo -e "${YELLOW}5. Run Sheet Metal tests:${NC}"
echo "   npx playwright test costing-unified.spec.ts --grep 'Sheet Metal' --headed\n"

echo -e "${YELLOW}6. Run with debug mode:${NC}"
echo "   npx playwright test costing-unified.spec.ts --headed --debug\n"

echo -e "${YELLOW}7. Generate HTML report:${NC}"
echo "   npx playwright show-report\n"

echo -e "${YELLOW}8. View test results JSON:${NC}"
echo "   cat test-results/costing-report.json\n"

echo -e "${YELLOW}9. Run all tests (costing_ + costing-unified):${NC}"
echo "   npx playwright test '**/costing*.spec.ts' --headed\n"

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}For detailed documentation, see: tests/COSTING_TEST_GUIDE.md${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}\n"

# Optional: Run smoke tests if --smoke flag provided
if [ "$1" = "--smoke" ]; then
  echo -e "${YELLOW}Running smoke tests...${NC}\n"
  npx playwright test costing-unified.spec.ts --grep '@smoke' --headed
fi

# Optional: Run full suite if --full flag provided
if [ "$1" = "--full" ]; then
  echo -e "${YELLOW}Running full test suite...${NC}\n"
  npx playwright test costing-unified.spec.ts --headed
fi
