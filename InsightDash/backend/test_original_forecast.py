#!/usr/bin/env python3
"""
Test the original forecast endpoint with target column
"""
import requests
import json

# Configuration
BASE_URL = "http://localhost:8000"
USERNAME = "testuser"
PASSWORD = "testpassword123"

def get_auth_token():
    """Get authentication token"""
    response = requests.post(
        f"{BASE_URL}/api/v1/auth/login",
        data={"username": USERNAME, "password": PASSWORD},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    if response.status_code == 200:
        return response.json()["access_token"]
    else:
        print(f"Auth failed: {response.text}")
        return None

def test_forecast_with_target_column(token, dataset_id=1):
    """Test the forecast endpoint with target column parameter"""
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    print("\n=== Testing Forecast with Target Column ===")
    
    response = requests.post(
        f"{BASE_URL}/api/v1/analytics/forecast/{dataset_id}?target_column=value&model_type=linear_regression&forecast_periods=7",
        headers=headers
    )
    
    if response.status_code == 200:
        result = response.json()
        print("✅ Forecast with target column successful!")
        print(f"Model type: {result.get('model_type')}")
        print(f"Target column: {result.get('target_column')}")
        print(f"Forecast data: {result.get('forecast_data')}")
        print(f"Forecast dates: {result.get('forecast_dates')}")
        if result.get('confidence_interval'):
            print("Confidence interval provided")
        if result.get('accuracy_metrics'):
            print(f"Accuracy metrics: {result.get('accuracy_metrics')}")
    else:
        print(f"❌ Forecast with target column failed: {response.status_code}")
        print(response.text)

def test_forecast_history(token, dataset_id=1):
    """Test forecast history endpoint"""
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    print("\n=== Testing Forecast History ===")
    
    response = requests.get(
        f"{BASE_URL}/api/v1/analytics/forecast/{dataset_id}/history",
        headers=headers
    )
    
    if response.status_code == 200:
        result = response.json()
        print("✅ Forecast history successful!")
        print(f"Number of forecasts: {len(result)}")
        if result:
            latest = result[0]
            print(f"Latest forecast ID: {latest.get('id')}")
            print(f"Latest forecast model: {latest.get('model_type')}")
            print(f"Latest forecast created: {latest.get('created_at')}")
    else:
        print(f"❌ Forecast history failed: {response.status_code}")
        print(response.text)

if __name__ == "__main__":
    print("Getting authentication token...")
    token = get_auth_token()
    
    if token:
        test_forecast_with_target_column(token)
        test_forecast_history(token)
    else:
        print("Failed to get authentication token")
