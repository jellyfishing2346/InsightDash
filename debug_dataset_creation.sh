#!/bin/bash

echo "🧪 Dataset Creation Troubleshooting Guide"
echo "========================================="

API_URL="http://localhost:8000/api/v1"

echo ""
echo "1. Testing backend connectivity..."
if curl -s "$API_URL/datasets" > /dev/null; then
    echo "✅ Backend is reachable at $API_URL"
else
    echo "❌ Backend is NOT reachable at $API_URL"
    echo "   Please check if the backend server is running on port 8000"
    exit 1
fi

echo ""
echo "2. Current datasets in backend:"
DATASETS=$(curl -s "$API_URL/datasets")
echo "$DATASETS" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if len(data) == 0:
        print('   No datasets found')
    else:
        for dataset in data:
            print(f'   - {dataset[\"name\"]} (ID: {dataset[\"id\"]})')
except:
    print('   Error parsing response')
"

echo ""
echo "3. Testing dataset creation via API..."
CREATE_RESPONSE=$(curl -s -X POST "$API_URL/datasets" \
    --data '{"name": "Debug Test Dataset", "description": "Created during troubleshooting"}' \
    --header 'Content-Type: application/json')

if echo "$CREATE_RESPONSE" | grep -q "Debug Test Dataset"; then
    echo "✅ API dataset creation works"
    DATASET_ID=$(echo "$CREATE_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])")
    echo "   Created dataset with ID: $DATASET_ID"
else
    echo "❌ API dataset creation failed"
    echo "   Response: $CREATE_RESPONSE"
fi

echo ""
echo "4. Frontend configuration check..."
ENV_FILE="/Users/test/InsightDash/InsightDash/frontend/.env"
if [ -f "$ENV_FILE" ]; then
    echo "✅ .env file exists"
    echo "   Content:"
    cat "$ENV_FILE" | sed 's/^/   /'
else
    echo "❌ .env file not found"
fi

echo ""
echo "5. Instructions for UI testing:"
echo "   a. Open http://localhost:3000/datasets in your browser"
echo "   b. Click the 'Create Dataset' button (blue button in top right)"
echo "   c. Fill in the form:"
echo "      - Dataset Name: Enter any name (required)"
echo "      - Description: Optional"
echo "      - File Type: Choose from dropdown"
echo "      - Data Source: Choose from dropdown"
echo "      - Public: Check/uncheck as desired"
echo "   d. Click 'Create Dataset'"
echo ""
echo "6. If the UI creation still fails:"
echo "   - Open browser developer tools (F12)"
echo "   - Go to Console tab"
echo "   - Try creating a dataset"
echo "   - Look for any error messages in red"
echo "   - Check the Network tab for failed requests"
echo ""
echo "7. Manual verification:"
curl -s "$API_URL/datasets" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(f'   Total datasets now: {len(data)}')
    for dataset in data:
        print(f'   - {dataset[\"name\"]} (ID: {dataset[\"id\"]})')
except:
    print('   Error parsing response')
"
