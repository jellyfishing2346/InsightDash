#!/usr/bin/env python3
"""
Script to create sample data for testing InsightDash
"""
import json
import requests
import random
from datetime import datetime, timedelta

# API Base URL
BASE_URL = "http://localhost:8000/api/v1"

def create_user():
    """Create a test user"""
    user_data = {
        "email": "test@example.com",
        "username": "testuser",
        "password": "testpassword123",
        "full_name": "Test User"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/register", json=user_data)
        print(f"User creation: {response.status_code}")
        if response.status_code == 200:
            print(f"User created: {response.json()}")
            return response.json()
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Error creating user: {e}")
    return None

def login_user():
    """Login and get access token"""
    login_data = {
        "username": "testuser",
        "password": "testpassword123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login", data=login_data)
        print(f"Login: {response.status_code}")
        if response.status_code == 200:
            token_data = response.json()
            print(f"Login successful: {token_data['token_type']} token received")
            return token_data["access_token"]
        else:
            print(f"Login error: {response.text}")
    except Exception as e:
        print(f"Error logging in: {e}")
    return None

def create_sample_dataset(token):
    """Create a sample dataset with data points"""
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create dataset
    dataset_data = {
        "name": "Sales Data Q1 2024",
        "description": "Monthly sales data for the first quarter of 2024",
        "data_type": "time_series",
        "is_public": True
    }
    
    try:
        response = requests.post(f"{BASE_URL}/datasets/", json=dataset_data, headers=headers)
        print(f"Dataset creation: {response.status_code}")
        if response.status_code == 200:
            dataset = response.json()
            print(f"Dataset created: {dataset['name']} (ID: {dataset['id']})")
            
            # Add data points
            base_date = datetime(2024, 1, 1)
            for i in range(90):  # 90 days of data
                date = base_date + timedelta(days=i)
                value = 1000 + random.randint(-200, 500) + (i * 10)  # Trending upward with noise
                
                data_point = {
                    "timestamp": date.isoformat(),
                    "value": float(value),
                    "meta_data": {"day_of_week": date.strftime("%A")}
                }
                
                point_response = requests.post(
                    f"{BASE_URL}/datasets/{dataset['id']}/data", 
                    json=data_point, 
                    headers=headers
                )
                
                if i % 30 == 0:  # Progress update every 30 days
                    print(f"Added data point for {date.strftime('%Y-%m-%d')}: {value}")
            
            print(f"✅ Sample dataset created with 90 data points!")
            return dataset
            
    except Exception as e:
        print(f"Error creating dataset: {e}")
    return None

def test_analytics(token, dataset_id):
    """Test analytics endpoints"""
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        # Test summary stats
        response = requests.get(f"{BASE_URL}/analytics/summary", headers=headers)
        print(f"Analytics summary: {response.status_code}")
        if response.status_code == 200:
            print(f"Summary: {response.json()}")
        
        # Test forecast
        forecast_data = {
            "dataset_id": dataset_id,
            "periods": 30,
            "model_type": "arima"
        }
        response = requests.post(f"{BASE_URL}/analytics/forecast", json=forecast_data, headers=headers)
        print(f"Forecast request: {response.status_code}")
        if response.status_code == 200:
            forecast = response.json()
            print(f"✅ Forecast generated: {len(forecast.get('forecast', []))} predictions")
        
    except Exception as e:
        print(f"Error testing analytics: {e}")

def main():
    print("🚀 Creating sample data for InsightDash...")
    print("=" * 50)
    
    # Step 1: Create user
    print("\n1. Creating test user...")
    create_user()
    
    # Step 2: Login
    print("\n2. Logging in...")
    token = login_user()
    if not token:
        print("❌ Could not login. Stopping.")
        return
    
    # Step 3: Create sample dataset
    print("\n3. Creating sample dataset...")
    dataset = create_sample_dataset(token)
    if not dataset:
        print("❌ Could not create dataset. Stopping.")
        return
    
    # Step 4: Test analytics
    print("\n4. Testing analytics...")
    test_analytics(token, dataset["id"])
    
    print("\n" + "=" * 50)
    print("✅ Sample data creation complete!")
    print(f"📊 Dataset ID: {dataset['id']}")
    print("🌐 Frontend: http://localhost:3000")
    print("📚 API Docs: http://localhost:8000/docs")

if __name__ == "__main__":
    main()
