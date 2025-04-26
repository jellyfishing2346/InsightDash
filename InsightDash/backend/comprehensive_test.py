#!/usr/bin/env python3
"""
Comprehensive test of all analytics endpoints
"""
import requests
import json
from datetime import datetime

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

def test_all_endpoints(token):
    """Test all analytics endpoints"""
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    print("=" * 60)
    print("COMPREHENSIVE ANALYTICS ENDPOINTS TEST")
    print("=" * 60)
    
    results = {
        "passed": 0,
        "failed": 0,
        "tests": []
    }
    
    # Test 1: Overall Analytics Summary
    print("\n1. Testing Overall Analytics Summary...")
    try:
        response = requests.get(f"{BASE_URL}/api/v1/analytics/summary", headers=headers)
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ PASS - {data['datasets_count']} datasets, {data['total_data_points']} data points")
            results["passed"] += 1
            results["tests"].append({"name": "Overall Analytics Summary", "status": "PASS"})
        else:
            print(f"   ❌ FAIL - Status: {response.status_code}")
            results["failed"] += 1
            results["tests"].append({"name": "Overall Analytics Summary", "status": "FAIL"})
    except Exception as e:
        print(f"   ❌ FAIL - Error: {e}")
        results["failed"] += 1
        results["tests"].append({"name": "Overall Analytics Summary", "status": "FAIL"})
    
    # Test 2: Dataset Analytics Summary
    print("\n2. Testing Dataset Analytics Summary...")
    try:
        response = requests.get(f"{BASE_URL}/api/v1/analytics/analytics/summary/1", headers=headers)
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ PASS - Dataset '{data['dataset_name']}' with {data['total_data_points']} points")
            results["passed"] += 1
            results["tests"].append({"name": "Dataset Analytics Summary", "status": "PASS"})
        else:
            print(f"   ❌ FAIL - Status: {response.status_code}")
            results["failed"] += 1
            results["tests"].append({"name": "Dataset Analytics Summary", "status": "FAIL"})
    except Exception as e:
        print(f"   ❌ FAIL - Error: {e}")
        results["failed"] += 1
        results["tests"].append({"name": "Dataset Analytics Summary", "status": "FAIL"})
    
    # Test 3: Forecast with ForecastRequest (new endpoint)
    print("\n3. Testing New Forecast Endpoint...")
    try:
        forecast_request = {
            "dataset_id": 1,
            "periods": 5,
            "model_type": "linear_regression"
        }
        response = requests.post(f"{BASE_URL}/api/v1/analytics/forecast", headers=headers, json=forecast_request)
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ PASS - Forecast ID: {data['forecast_id']}, Model: {data['model_type']}")
            results["passed"] += 1
            results["tests"].append({"name": "New Forecast Endpoint", "status": "PASS"})
        else:
            print(f"   ❌ FAIL - Status: {response.status_code}")
            results["failed"] += 1
            results["tests"].append({"name": "New Forecast Endpoint", "status": "FAIL"})
    except Exception as e:
        print(f"   ❌ FAIL - Error: {e}")
        results["failed"] += 1
        results["tests"].append({"name": "New Forecast Endpoint", "status": "FAIL"})
    
    # Test 4: Forecast with Target Column (original endpoint)
    print("\n4. Testing Original Forecast Endpoint...")
    try:
        response = requests.post(
            f"{BASE_URL}/api/v1/analytics/forecast/1?target_column=value&model_type=arima&forecast_periods=6",
            headers=headers
        )
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ PASS - Model: {data['model_type']}, Target: {data['target_column']}")
            results["passed"] += 1
            results["tests"].append({"name": "Original Forecast Endpoint", "status": "PASS"})
        else:
            print(f"   ❌ FAIL - Status: {response.status_code}")
            results["failed"] += 1
            results["tests"].append({"name": "Original Forecast Endpoint", "status": "FAIL"})
    except Exception as e:
        print(f"   ❌ FAIL - Error: {e}")
        results["failed"] += 1
        results["tests"].append({"name": "Original Forecast Endpoint", "status": "FAIL"})
    
    # Test 5: Forecast History
    print("\n5. Testing Forecast History...")
    try:
        response = requests.get(f"{BASE_URL}/api/v1/analytics/forecast/1/history", headers=headers)
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ PASS - {len(data)} forecast records found")
            results["passed"] += 1
            results["tests"].append({"name": "Forecast History", "status": "PASS"})
        else:
            print(f"   ❌ FAIL - Status: {response.status_code}")
            results["failed"] += 1
            results["tests"].append({"name": "Forecast History", "status": "FAIL"})
    except Exception as e:
        print(f"   ❌ FAIL - Error: {e}")
        results["failed"] += 1
        results["tests"].append({"name": "Forecast History", "status": "FAIL"})
    
    # Test 6: Multiple Model Types
    print("\n6. Testing Multiple Model Types...")
    model_types = ["linear_regression", "arima", "moving_average"]
    model_results = {"passed": 0, "failed": 0}
    
    for model_type in model_types:
        try:
            forecast_request = {
                "dataset_id": 1,
                "periods": 3,
                "model_type": model_type
            }
            response = requests.post(f"{BASE_URL}/api/v1/analytics/forecast", headers=headers, json=forecast_request)
            if response.status_code == 200:
                print(f"   ✅ {model_type} - PASS")
                model_results["passed"] += 1
            else:
                print(f"   ❌ {model_type} - FAIL (Status: {response.status_code})")
                model_results["failed"] += 1
        except Exception as e:
            print(f"   ❌ {model_type} - FAIL (Error: {e})")
            model_results["failed"] += 1
    
    if model_results["failed"] == 0:
        results["passed"] += 1
        results["tests"].append({"name": "Multiple Model Types", "status": "PASS"})
    else:
        results["failed"] += 1
        results["tests"].append({"name": "Multiple Model Types", "status": "FAIL"})
    
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    print(f"Total Tests: {results['passed'] + results['failed']}")
    print(f"Passed: {results['passed']} ✅")
    print(f"Failed: {results['failed']} ❌")
    print(f"Success Rate: {(results['passed'] / (results['passed'] + results['failed']) * 100):.1f}%")
    
    print("\nDetailed Results:")
    for test in results["tests"]:
        status_icon = "✅" if test["status"] == "PASS" else "❌"
        print(f"  {status_icon} {test['name']}: {test['status']}")
    
    if results["failed"] == 0:
        print("\n🎉 ALL TESTS PASSED! Analytics endpoints are fully functional.")
    else:
        print(f"\n⚠️  {results['failed']} tests failed. See details above.")

if __name__ == "__main__":
    print("Getting authentication token...")
    token = get_auth_token()
    
    if token:
        test_all_endpoints(token)
    else:
        print("Failed to get authentication token")
