#!/bin/bash

# Test script for InsightDash edit/delete functionality
echo "🧪 Testing InsightDash Edit/Delete Functionality"
echo "================================================"

# Base URL for the API
API_URL="http://localhost:8002/api/v1"

echo ""
echo "1. Checking if backend is running..."
if curl -s "$API_URL/datasets" > /dev/null; then
    echo "✅ Backend is running"
else
    echo "❌ Backend is not running. Please start the backend server."
    exit 1
fi

echo ""
echo "2. Getting current datasets..."
echo "Current datasets:"
curl -s "$API_URL/datasets" | python3 -m json.tool | grep -E '"id"|"name"'

echo ""
echo "3. Testing UPDATE functionality..."
echo "Updating dataset with ID '2'..."
UPDATE_RESPONSE=$(curl -s -X PUT "$API_URL/datasets/2" \
    --data '{"name": "Test Updated Dataset", "description": "This dataset was updated via API test"}' \
    --header 'Content-Type: application/json')

if echo "$UPDATE_RESPONSE" | grep -q "updated successfully"; then
    echo "✅ UPDATE test passed"
    echo "Response: $UPDATE_RESPONSE"
else
    echo "❌ UPDATE test failed"
    echo "Response: $UPDATE_RESPONSE"
fi

echo ""
echo "4. Verifying the update..."
UPDATED_DATASET=$(curl -s "$API_URL/datasets/2")
if echo "$UPDATED_DATASET" | grep -q "Test Updated Dataset"; then
    echo "✅ Update verification passed"
else
    echo "❌ Update verification failed"
fi

echo ""
echo "5. Testing DELETE functionality..."
echo "Attempting to delete dataset with ID '2'..."
DELETE_RESPONSE=$(curl -s -X DELETE "$API_URL/datasets/2")

if echo "$DELETE_RESPONSE" | grep -q "deleted successfully"; then
    echo "✅ DELETE test passed"
    echo "Response: $DELETE_RESPONSE"
else
    echo "❌ DELETE test failed"
    echo "Response: $DELETE_RESPONSE"
fi

echo ""
echo "6. Verifying the deletion..."
REMAINING_DATASETS=$(curl -s "$API_URL/datasets")
if echo "$REMAINING_DATASETS" | grep -q '"id": "2"'; then
    echo "❌ Delete verification failed - dataset still exists"
else
    echo "✅ Delete verification passed - dataset was removed"
fi

echo ""
echo "7. Final datasets list:"
curl -s "$API_URL/datasets" | python3 -m json.tool | grep -E '"id"|"name"'

echo ""
echo "🎉 Test completed!"
echo ""
echo "Next steps:"
echo "1. Open http://localhost:3000/datasets in your browser"
echo "2. Try clicking Edit and Delete buttons on dataset cards"
echo "3. Verify the UI functionality works as expected"
