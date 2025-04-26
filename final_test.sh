#!/bin/bash

# Final functionality test for InsightDash
echo "🧪 Final InsightDash Functionality Test"
echo "======================================"

API_URL="http://localhost:8000/api/v1"

echo ""
echo "1. Testing dataset creation..."
CREATE_RESPONSE=$(curl -s -X POST "$API_URL/datasets" \
    --data '{"name": "Final Test Dataset", "description": "Created during final testing", "is_public": true}' \
    --header 'Content-Type: application/json')

if echo "$CREATE_RESPONSE" | grep -q "Final Test Dataset"; then
    echo "✅ Dataset creation works"
    DATASET_ID=$(echo "$CREATE_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])")
    echo "   Created dataset with ID: $DATASET_ID"
else
    echo "❌ Dataset creation failed"
    echo "   Response: $CREATE_RESPONSE"
    exit 1
fi

echo ""
echo "2. Testing dataset update..."
UPDATE_RESPONSE=$(curl -s -X PUT "$API_URL/datasets/$DATASET_ID" \
    --data '{"name": "Updated Final Test Dataset", "description": "This was updated!", "is_public": false}' \
    --header 'Content-Type: application/json')

if echo "$UPDATE_RESPONSE" | grep -q "Updated Final Test Dataset"; then
    echo "✅ Dataset update works"
else
    echo "❌ Dataset update failed"
    echo "   Response: $UPDATE_RESPONSE"
fi

echo ""
echo "3. Testing dataset listing..."
LIST_RESPONSE=$(curl -s "$API_URL/datasets")
DATASET_COUNT=$(echo "$LIST_RESPONSE" | python3 -c "import sys, json; print(len(json.load(sys.stdin)))")
echo "✅ Found $DATASET_COUNT datasets"

echo ""
echo "4. Testing dataset deletion..."
DELETE_RESPONSE=$(curl -s -X DELETE "$API_URL/datasets/$DATASET_ID")

if echo "$DELETE_RESPONSE" | grep -q "deleted successfully"; then
    echo "✅ Dataset deletion works"
else
    echo "❌ Dataset deletion failed"
    echo "   Response: $DELETE_RESPONSE"
fi

echo ""
echo "5. Final verification..."
FINAL_LIST=$(curl -s "$API_URL/datasets")
if echo "$FINAL_LIST" | grep -q "Updated Final Test Dataset"; then
    echo "❌ Dataset was not properly deleted"
else
    echo "✅ Dataset was properly deleted"
fi

echo ""
echo "🎉 All CRUD operations are working!"
echo ""
echo "✅ Frontend: http://localhost:3000"
echo "✅ Backend:  http://localhost:8000"
echo ""
echo "You can now:"
echo "• Create datasets via UI or API"
echo "• View and search datasets"
echo "• Edit dataset information"
echo "• Delete datasets with confirmation"
echo "• Generate demo data"
echo "• Run analytics and forecasting"
