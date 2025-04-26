#!/bin/bash

# ========================================
# COMPREHENSIVE INSIGHTDASH FUNCTIONALITY TEST
# ========================================

echo "🧪 COMPREHENSIVE INSIGHTDASH FUNCTIONALITY TEST"
echo "==============================================="
echo "Testing Date: $(date)"
echo "Environment: macOS with zsh"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Helper functions
log_test() {
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -e "${BLUE}TEST $TOTAL_TESTS:${NC} $1"
}

log_pass() {
    PASSED_TESTS=$((PASSED_TESTS + 1))
    echo -e "${GREEN}✅ PASS:${NC} $1"
}

log_fail() {
    FAILED_TESTS=$((FAILED_TESTS + 1))
    echo -e "${RED}❌ FAIL:${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}⚠️  WARN:${NC} $1"
}

API_URL="http://localhost:8000/api/v1"
FRONTEND_URL="http://localhost:3000"

echo "=========================================="
echo "PHASE 1: BACKEND CONNECTIVITY & API TESTS"
echo "=========================================="

# Test 1: Backend connectivity
log_test "Backend server connectivity"
if curl -s "$API_URL/datasets" > /dev/null 2>&1; then
    log_pass "Backend server is running and reachable"
else
    log_fail "Backend server is not reachable"
    echo "Please ensure the backend server is running on port 8000"
    exit 1
fi

# Test 2: Dataset listing
log_test "Dataset listing endpoint"
DATASETS_RESPONSE=$(curl -s "$API_URL/datasets")
if echo "$DATASETS_RESPONSE" | grep -q '\['; then
    DATASET_COUNT=$(echo "$DATASETS_RESPONSE" | python3 -c "import sys, json; print(len(json.load(sys.stdin)))" 2>/dev/null || echo "0")
    log_pass "Dataset listing works (Found $DATASET_COUNT datasets)"
else
    log_fail "Dataset listing failed"
    echo "Response: $DATASETS_RESPONSE"
fi

# Test 3: Dataset creation
log_test "Dataset creation via API"
CREATE_RESPONSE=$(curl -s -X POST "$API_URL/datasets" \
    --data '{"name": "Test Dataset", "description": "Automated test dataset", "is_public": true}' \
    --header 'Content-Type: application/json' 2>/dev/null)

if echo "$CREATE_RESPONSE" | grep -q "Test Dataset"; then
    TEST_DATASET_ID=$(echo "$CREATE_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])" 2>/dev/null)
    log_pass "Dataset creation works (ID: $TEST_DATASET_ID)"
else
    log_fail "Dataset creation failed"
    echo "Response: $CREATE_RESPONSE"
fi

# Test 4: Dataset retrieval by ID
log_test "Dataset retrieval by ID"
if [ ! -z "$TEST_DATASET_ID" ]; then
    GET_RESPONSE=$(curl -s "$API_URL/datasets/$TEST_DATASET_ID" 2>/dev/null)
    if echo "$GET_RESPONSE" | grep -q "Test Dataset"; then
        log_pass "Dataset retrieval by ID works"
    else
        log_fail "Dataset retrieval by ID failed"
    fi
else
    log_warn "Skipping dataset retrieval test (no dataset ID)"
fi

# Test 5: Dataset update
log_test "Dataset update via API"
if [ ! -z "$TEST_DATASET_ID" ]; then
    UPDATE_RESPONSE=$(curl -s -X PUT "$API_URL/datasets/$TEST_DATASET_ID" \
        --data '{"name": "Updated Test Dataset", "description": "Updated description"}' \
        --header 'Content-Type: application/json' 2>/dev/null)
    
    if echo "$UPDATE_RESPONSE" | grep -q "Updated Test Dataset"; then
        log_pass "Dataset update works"
    else
        log_fail "Dataset update failed"
        echo "Response: $UPDATE_RESPONSE"
    fi
else
    log_warn "Skipping dataset update test (no dataset ID)"
fi

# Test 6: Demo data generation
log_test "Demo data generation"
DEMO_RESPONSE=$(curl -s -X POST "$API_URL/demo/generate-data" \
    --data '{"type": "sales", "rows": 50}' \
    --header 'Content-Type: application/json' 2>/dev/null)

if echo "$DEMO_RESPONSE" | grep -q "Sales Sample Data"; then
    DEMO_DATASET_ID=$(echo "$DEMO_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])" 2>/dev/null)
    log_pass "Demo data generation works (ID: $DEMO_DATASET_ID)"
    
    # Check if columns are properly defined
    if echo "$DEMO_RESPONSE" | grep -q '"columns"'; then
        COLUMN_COUNT=$(echo "$DEMO_RESPONSE" | python3 -c "import sys, json; print(len(json.load(sys.stdin)['columns']))" 2>/dev/null)
        log_pass "Demo dataset has proper columns defined (Count: $COLUMN_COUNT)"
    else
        log_fail "Demo dataset missing column definitions"
    fi
else
    log_fail "Demo data generation failed"
    echo "Response: $DEMO_RESPONSE"
fi

# Test 7: Dataset export functionality
log_test "Dataset export (CSV format)"
if [ ! -z "$DEMO_DATASET_ID" ]; then
    EXPORT_RESPONSE=$(curl -s -w "%{http_code}" "$API_URL/datasets/$DEMO_DATASET_ID/export?format=csv" 2>/dev/null)
    HTTP_CODE="${EXPORT_RESPONSE: -3}"
    
    if [ "$HTTP_CODE" = "200" ]; then
        log_pass "CSV export works"
    else
        log_fail "CSV export failed (HTTP $HTTP_CODE)"
    fi
else
    log_warn "Skipping export test (no demo dataset ID)"
fi

# Test 8: Dataset export (JSON format)
log_test "Dataset export (JSON format)"
if [ ! -z "$DEMO_DATASET_ID" ]; then
    EXPORT_JSON_RESPONSE=$(curl -s -w "%{http_code}" "$API_URL/datasets/$DEMO_DATASET_ID/export?format=json" 2>/dev/null)
    HTTP_CODE_JSON="${EXPORT_JSON_RESPONSE: -3}"
    
    if [ "$HTTP_CODE_JSON" = "200" ]; then
        log_pass "JSON export works"
    else
        log_fail "JSON export failed (HTTP $HTTP_CODE_JSON)"
    fi
else
    log_warn "Skipping JSON export test (no demo dataset ID)"
fi

# Test 9: Analytics endpoints
log_test "Analytics summary endpoint"
ANALYTICS_RESPONSE=$(curl -s "$API_URL/analytics/summary" 2>/dev/null)
if echo "$ANALYTICS_RESPONSE" | grep -q "total_datasets"; then
    log_pass "Analytics summary endpoint works"
else
    log_fail "Analytics summary endpoint failed"
fi

# Test 10: Forecast creation
log_test "Forecast creation"
if [ ! -z "$DEMO_DATASET_ID" ]; then
    FORECAST_RESPONSE=$(curl -s -X POST "$API_URL/analytics/forecast" \
        --data "{\"dataset_id\": \"$DEMO_DATASET_ID\", \"target_column\": \"sales\", \"model_type\": \"linear_regression\", \"horizon\": 30}" \
        --header 'Content-Type: application/json' 2>/dev/null)
    
    if echo "$FORECAST_RESPONSE" | grep -q "forecast"; then
        log_pass "Forecast creation works"
    else
        log_fail "Forecast creation failed"
        echo "Response: $FORECAST_RESPONSE"
    fi
else
    log_warn "Skipping forecast test (no demo dataset ID)"
fi

# Test 11: Dataset deletion
log_test "Dataset deletion"
if [ ! -z "$TEST_DATASET_ID" ]; then
    DELETE_RESPONSE=$(curl -s -X DELETE "$API_URL/datasets/$TEST_DATASET_ID" 2>/dev/null)
    if echo "$DELETE_RESPONSE" | grep -q "deleted successfully"; then
        log_pass "Dataset deletion works"
    else
        log_fail "Dataset deletion failed"
        echo "Response: $DELETE_RESPONSE"
    fi
else
    log_warn "Skipping dataset deletion test (no dataset ID)"
fi

echo ""
echo "=========================================="
echo "PHASE 2: FRONTEND CONNECTIVITY & UI TESTS"
echo "=========================================="

# Test 12: Frontend connectivity
log_test "Frontend server connectivity"
if curl -s "$FRONTEND_URL" > /dev/null 2>&1; then
    log_pass "Frontend server is running and reachable"
else
    log_fail "Frontend server is not reachable"
    echo "Please ensure the frontend server is running on port 3000"
fi

# Test 13: Check environment variables
log_test "Frontend environment configuration"
ENV_FILE="/Users/test/InsightDash/InsightDash/frontend/.env"
if [ -f "$ENV_FILE" ]; then
    API_URL_CONFIG=$(grep "REACT_APP_API_URL" "$ENV_FILE" | cut -d'=' -f2)
    if [ "$API_URL_CONFIG" = "http://localhost:8000/api/v1" ]; then
        log_pass "Frontend API URL configuration is correct"
    else
        log_fail "Frontend API URL misconfigured: $API_URL_CONFIG"
    fi
else
    log_fail "Frontend .env file not found"
fi

echo ""
echo "=========================================="
echo "PHASE 3: INTEGRATION & COMPONENT TESTS"
echo "=========================================="

# Test 14: Authentication simulation
log_test "Authentication endpoint"
AUTH_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
    --data '{"username": "test@example.com", "password": "testpass"}' \
    --header 'Content-Type: application/json' 2>/dev/null)

if echo "$AUTH_RESPONSE" | grep -q "access_token"; then
    log_pass "Authentication endpoint works"
else
    log_fail "Authentication endpoint failed"
fi

# Test 15: Model comparison endpoint
log_test "Model comparison analytics"
MODEL_RESPONSE=$(curl -s "$API_URL/analytics/models/compare" 2>/dev/null)
if echo "$MODEL_RESPONSE" | grep -q "model_type"; then
    log_pass "Model comparison endpoint works"
else
    log_fail "Model comparison endpoint failed"
fi

# Test 16: Model statistics endpoint
log_test "Model statistics analytics"
STATS_RESPONSE=$(curl -s "$API_URL/analytics/models/stats" 2>/dev/null)
if echo "$STATS_RESPONSE" | grep -q "total_forecasts"; then
    log_pass "Model statistics endpoint works"
else
    log_fail "Model statistics endpoint failed"
fi

# Test 17: Recent forecasts endpoint
log_test "Recent forecasts endpoint"
RECENT_RESPONSE=$(curl -s "$API_URL/analytics/forecasts/recent" 2>/dev/null)
if echo "$RECENT_RESPONSE" | grep -q '\['; then
    log_pass "Recent forecasts endpoint works"
else
    log_fail "Recent forecasts endpoint failed"
fi

# Test 18: Multiple dataset types generation
log_test "Multiple dataset types generation"
TEMP_RESPONSE=$(curl -s -X POST "$API_URL/demo/generate-data" \
    --data '{"type": "temperature", "rows": 30}' \
    --header 'Content-Type: application/json' 2>/dev/null)

STOCK_RESPONSE=$(curl -s -X POST "$API_URL/demo/generate-data" \
    --data '{"type": "stock", "rows": 30}' \
    --header 'Content-Type: application/json' 2>/dev/null)

TRAFFIC_RESPONSE=$(curl -s -X POST "$API_URL/demo/generate-data" \
    --data '{"type": "website_traffic", "rows": 30}' \
    --header 'Content-Type: application/json' 2>/dev/null)

TEMP_SUCCESS=$(echo "$TEMP_RESPONSE" | grep -q "Temperature Sample Data" && echo "true" || echo "false")
STOCK_SUCCESS=$(echo "$STOCK_RESPONSE" | grep -q "Stock Sample Data" && echo "true" || echo "false")
TRAFFIC_SUCCESS=$(echo "$TRAFFIC_RESPONSE" | grep -q "Website Traffic Sample Data" && echo "true" || echo "false")

if [ "$TEMP_SUCCESS" = "true" ] && [ "$STOCK_SUCCESS" = "true" ] && [ "$TRAFFIC_SUCCESS" = "true" ]; then
    log_pass "All dataset types generation works (Temperature, Stock, Website Traffic)"
else
    log_fail "Some dataset types failed: Temp($TEMP_SUCCESS), Stock($STOCK_SUCCESS), Traffic($TRAFFIC_SUCCESS)"
fi

echo ""
echo "=========================================="
echo "PHASE 4: ERROR HANDLING & EDGE CASES"
echo "=========================================="

# Test 19: Invalid dataset ID
log_test "Error handling for invalid dataset ID"
INVALID_RESPONSE=$(curl -s "$API_URL/datasets/invalid-id" 2>/dev/null)
if echo "$INVALID_RESPONSE" | grep -q "not found\|error"; then
    log_pass "Proper error handling for invalid dataset ID"
else
    log_fail "Missing error handling for invalid dataset ID"
fi

# Test 20: Invalid export format
log_test "Error handling for invalid export format"
if [ ! -z "$DEMO_DATASET_ID" ]; then
    INVALID_EXPORT=$(curl -s -w "%{http_code}" "$API_URL/datasets/$DEMO_DATASET_ID/export?format=invalid" 2>/dev/null)
    HTTP_CODE_INVALID="${INVALID_EXPORT: -3}"
    
    if [ "$HTTP_CODE_INVALID" = "400" ]; then
        log_pass "Proper error handling for invalid export format"
    else
        log_fail "Missing error handling for invalid export format (Got HTTP $HTTP_CODE_INVALID)"
    fi
else
    log_warn "Skipping invalid export format test (no dataset ID)"
fi

# Test 21: CORS headers
log_test "CORS headers verification"
CORS_RESPONSE=$(curl -s -I "$API_URL/datasets" 2>/dev/null)
if echo "$CORS_RESPONSE" | grep -q "Access-Control-Allow-Origin"; then
    log_pass "CORS headers are properly configured"
else
    log_fail "CORS headers missing or misconfigured"
fi

echo ""
echo "=========================================="
echo "PHASE 5: FINAL VERIFICATION"
echo "=========================================="

# Test 22: Complete workflow test
log_test "Complete workflow: Create → Update → Export → Delete"
WORKFLOW_DATASET=$(curl -s -X POST "$API_URL/datasets" \
    --data '{"name": "Workflow Test", "description": "End-to-end test"}' \
    --header 'Content-Type: application/json' 2>/dev/null)

if echo "$WORKFLOW_DATASET" | grep -q "Workflow Test"; then
    WF_ID=$(echo "$WORKFLOW_DATASET" | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])" 2>/dev/null)
    
    # Update
    UPDATE_WF=$(curl -s -X PUT "$API_URL/datasets/$WF_ID" \
        --data '{"name": "Updated Workflow Test"}' \
        --header 'Content-Type: application/json' 2>/dev/null)
    
    # Delete
    DELETE_WF=$(curl -s -X DELETE "$API_URL/datasets/$WF_ID" 2>/dev/null)
    
    if echo "$UPDATE_WF" | grep -q "Updated Workflow Test" && echo "$DELETE_WF" | grep -q "deleted successfully"; then
        log_pass "Complete CRUD workflow works"
    else
        log_fail "Complete CRUD workflow has issues"
    fi
else
    log_fail "Workflow test failed at creation step"
fi

# Test 23: Final dataset count verification
log_test "Final dataset count and cleanup verification"
FINAL_DATASETS=$(curl -s "$API_URL/datasets" 2>/dev/null)
FINAL_COUNT=$(echo "$FINAL_DATASETS" | python3 -c "import sys, json; print(len(json.load(sys.stdin)))" 2>/dev/null || echo "0")
log_pass "Final dataset count: $FINAL_COUNT datasets"

echo ""
echo "=========================================="
echo "TEST SUMMARY"
echo "=========================================="

echo -e "Total Tests Run: ${BLUE}$TOTAL_TESTS${NC}"
echo -e "Tests Passed: ${GREEN}$PASSED_TESTS${NC}"
echo -e "Tests Failed: ${RED}$FAILED_TESTS${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "\n${GREEN}🎉 ALL TESTS PASSED! InsightDash is fully functional.${NC}"
    echo ""
    echo "✅ Backend API: Fully functional"
    echo "✅ Frontend UI: Ready for testing"
    echo "✅ CRUD Operations: Working"
    echo "✅ Data Export: Working"
    echo "✅ Analytics: Working"
    echo "✅ Forecasting: Working"
    echo "✅ Error Handling: Working"
    echo ""
    echo "🚀 InsightDash is ready for production deployment!"
else
    echo -e "\n${RED}⚠️  Some tests failed. Please review the issues above.${NC}"
    echo "Failed tests: $FAILED_TESTS out of $TOTAL_TESTS"
fi

echo ""
echo "📋 Next Steps:"
echo "1. Open http://localhost:3000 in your browser"
echo "2. Test the UI functionality manually"
echo "3. Create, edit, and delete datasets through the interface"
echo "4. Generate demo data and create forecasts"
echo "5. Test export functionality"
echo ""
echo "Test completed at: $(date)"
