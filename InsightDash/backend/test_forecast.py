#!/usr/bin/env python3
"""
Script to add test data points to the database for testing forecasting
"""
import requests
import json
from datetime import datetime, timedelta

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

def add_data_points(token, dataset_id=1):
    """Add test data points"""
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Generate 15 data points with some trend
    base_date = datetime(2024, 1, 1)
    for i in range(15):
        date = base_date + timedelta(days=i*30)  # Monthly data
        value = 100 + i * 5 + (i % 3) * 2  # Add some variation
        
        data_point = {
            "timestamp": date.isoformat(),
            "value": float(value),
            "meta_data": {"month": f"Month {i+1}", "trend": "up"}
        }
        
        response = requests.post(
            f"{BASE_URL}/api/v1/datasets/{dataset_id}/data",
            headers=headers,
            json=data_point
        )
        
        if response.status_code == 200:
            print(f"Added data point {i+1}: value={value}, date={date.strftime('%Y-%m-%d')}")
        else:
            print(f"Failed to add data point {i+1}: {response.text}")

def test_forecast(token, dataset_id=1):
    """Test the forecast endpoint"""
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    forecast_request = {
        "dataset_id": dataset_id,
        "periods": 10,
        "model_type": "linear_regression"
    }
    
    response = requests.post(
        f"{BASE_URL}/api/v1/analytics/forecast",
        headers=headers,
        json=forecast_request
    )
    
    if response.status_code == 200:
        result = response.json()
        print("Forecast successful!")
        print(f"Forecast ID: {result.get('forecast_id')}")
        print(f"Model type: {result.get('model_type')}")
        print(f"Periods: {result.get('periods')}")
        print(f"Forecast values: {result.get('forecast')[:5]}...")  # Show first 5 values
        if result.get('confidence_interval'):
            print("Confidence interval provided")
        if result.get('metrics'):
            print(f"Metrics: {result.get('metrics')}")
    else:
        print(f"Forecast failed: {response.status_code}")
        print(response.text)

if __name__ == "__main__":
    print("Getting authentication token...")
    token = get_auth_token()
    
    if token:
        print("Adding test data points...")
        add_data_points(token)
        
        print("\nTesting forecast endpoint...")
        test_forecast(token)
    else:
        print("Failed to get authentication token")
