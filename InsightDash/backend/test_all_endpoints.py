#!/usr/bin/env python3
"""
Test all forecast model types
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

def test_forecast_models(token, dataset_id=1):
    """Test different forecast models"""
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    models = ["linear_regression", "arima", "moving_average"]
    
    for model_type in models:
        print(f"\n=== Testing {model_type} model ===")
        
        forecast_request = {
            "dataset_id": dataset_id,
            "periods": 5,
            "model_type": model_type
        }
        
        response = requests.post(
            f"{BASE_URL}/api/v1/analytics/forecast",
            headers=headers,
            json=forecast_request
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ {model_type} forecast successful!")
            print(f"Forecast ID: {result.get('forecast_id')}")
            print(f"Forecast values: {result.get('forecast')}")
            if result.get('confidence_interval'):
                print(f"Confidence interval lower: {result['confidence_interval']['lower']}")
                print(f"Confidence interval upper: {result['confidence_interval']['upper']}")
            if result.get('metrics'):
                print(f"Metrics: {result.get('metrics')}")
        else:
            print(f"❌ {model_type} forecast failed: {response.status_code}")
            print(response.text)

def test_analytics_summary(token, dataset_id=1):
    """Test analytics summary"""
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    print("\n=== Testing Analytics Summary ===")
    
    # Test overall summary
    response = requests.get(
        f"{BASE_URL}/api/v1/analytics/summary",
        headers=headers
    )
    
    if response.status_code == 200:
        result = response.json()
        print("✅ Overall analytics summary successful!")
        print(f"Datasets count: {result.get('datasets_count')}")
        print(f"Total data points: {result.get('total_data_points')}")
        print(f"Recent activity: {result.get('recent_activity')}")
    else:
        print(f"❌ Overall analytics summary failed: {response.status_code}")
        print(response.text)
    
    # Test dataset-specific summary
    response = requests.get(
        f"{BASE_URL}/api/v1/analytics/analytics/summary/{dataset_id}",
        headers=headers
    )
    
    if response.status_code == 200:
        result = response.json()
        print("✅ Dataset analytics summary successful!")
        print(f"Dataset name: {result.get('dataset_name')}")
        print(f"Total data points: {result.get('total_data_points')}")
        print(f"Available columns: {result.get('available_columns')}")
        print(f"Latest data timestamp: {result.get('latest_data_timestamp')}")
    else:
        print(f"❌ Dataset analytics summary failed: {response.status_code}")
        print(response.text)

if __name__ == "__main__":
    print("Getting authentication token...")
    token = get_auth_token()
    
    if token:
        test_analytics_summary(token)
        test_forecast_models(token)
    else:
        print("Failed to get authentication token")
