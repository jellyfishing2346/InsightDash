#!/usr/bin/env python3
"""
Simple mock backend server for InsightDash
This serves as a lightweight alternative when dependencies can't be installed
"""

import json
import datetime
import random
import time
import numpy as np
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import threading
import socket
import os

# Get port from environment variable (for cloud deployment)
PORT = int(os.getenv('PORT', 8000))

# Mock data
MOCK_DATASETS = [
    {
        "id": "1",
        "name": "Sales Data",
        "description": "Monthly sales data for 2024",
        "file_type": "csv",
        "row_count": 1250,
        "column_count": 8,
        "file_size": 125000,
        "status": "active",
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-12-01T14:20:00Z",
        "columns": [
            {"name": "date", "type": "datetime"},
            {"name": "sales", "type": "number"},
            {"name": "region", "type": "string"},
            {"name": "product", "type": "string"},
            {"name": "quantity", "type": "integer"},
            {"name": "revenue", "type": "number"},
            {"name": "cost", "type": "number"},
            {"name": "profit", "type": "number"}
        ]
    },
    {
        "id": "2", 
        "name": "Customer Analytics",
        "description": "Customer behavior and demographics",
        "file_type": "json",
        "row_count": 5000,
        "column_count": 12,
        "file_size": 850000,
        "status": "active",
        "created_at": "2024-02-10T09:15:00Z",
        "updated_at": "2024-11-15T16:45:00Z",
        "columns": [
            {"name": "customer_id", "type": "string"},
            {"name": "age", "type": "integer"},
            {"name": "gender", "type": "string"},
            {"name": "location", "type": "string"},
            {"name": "signup_date", "type": "datetime"},
            {"name": "total_purchases", "type": "integer"},
            {"name": "avg_order_value", "type": "number"},
            {"name": "last_purchase", "type": "datetime"},
            {"name": "satisfaction_score", "type": "number"},
            {"name": "churn_risk", "type": "number"},
            {"name": "lifetime_value", "type": "number"},
            {"name": "preferred_category", "type": "string"}
        ]
    },
    {
        "id": "3",
        "name": "IoT Sensor Data", 
        "description": "Real-time sensor readings from factory floor",
        "file_type": "csv",
        "row_count": 50000,
        "column_count": 6,
        "file_size": 2500000,
        "status": "active", 
        "created_at": "2024-03-01T08:00:00Z",
        "updated_at": "2025-01-13T12:00:00Z",
        "columns": [
            {"name": "timestamp", "type": "datetime"},
            {"name": "sensor_id", "type": "string"},
            {"name": "temperature", "type": "number"},
            {"name": "humidity", "type": "number"},
            {"name": "pressure", "type": "number"},
            {"name": "vibration", "type": "number"}
        ]
    }
]

MOCK_FORECASTS = [
    {
        "id": "f1",
        "dataset_id": "1",
        "dataset_name": "Sales Data",
        "model_type": "linear_regression",
        "target_column": "sales",
        "date_column": "date",
        "horizon": 30,
        "accuracy": 85.6,
        "mse": 0.0234,
        "mae": 0.121,
        "rmse": 0.153,
        "created_at": "2025-01-10T10:00:00Z",
        "status": "completed"
    },
    {
        "id": "f2",
        "dataset_id": "1", 
        "dataset_name": "Sales Data",
        "model_type": "arima",
        "target_column": "sales",
        "date_column": "date",
        "horizon": 30,
        "accuracy": 92.3,
        "mse": 0.0156,
        "mae": 0.098,
        "rmse": 0.125,
        "created_at": "2025-01-11T14:30:00Z",
        "status": "completed"
    },
    {
        "id": "f3",
        "dataset_id": "2",
        "dataset_name": "Customer Analytics", 
        "model_type": "moving_average",
        "target_column": "total_purchases",
        "date_column": "signup_date",
        "horizon": 14,
        "accuracy": 78.9,
        "mse": 0.0345,
        "mae": 0.156,
        "rmse": 0.186,
        "created_at": "2025-01-12T09:15:00Z",
        "status": "completed"
    }
]

def generate_sample_data(dataset_id, count=50):
    """Generate sample preview data"""
    dataset = next((d for d in MOCK_DATASETS if d["id"] == dataset_id), None)
    if not dataset:
        return []
    
    data = []
    for i in range(count):
        row = {}
        for col in dataset["columns"]:
            if col["type"] == "datetime":
                base_date = datetime.datetime(2024, 1, 1) + datetime.timedelta(days=i*2)
                row[col["name"]] = base_date.isoformat() + "Z"
            elif col["type"] == "number":
                row[col["name"]] = round(random.uniform(10, 1000), 2)
            elif col["type"] == "integer":
                row[col["name"]] = random.randint(1, 100)
            elif col["type"] == "string":
                if "region" in col["name"]:
                    row[col["name"]] = random.choice(["North", "South", "East", "West"])
                elif "product" in col["name"]:
                    row[col["name"]] = random.choice(["Product A", "Product B", "Product C"])
                elif "category" in col["name"]:
                    row[col["name"]] = random.choice(["Electronics", "Clothing", "Books"])
                else:
                    row[col["name"]] = f"Value_{i}"
        data.append(row)
    return data

def generate_analytics_summary():
    return {
        "total_datasets": len(MOCK_DATASETS),
        "active_forecasts": len([f for f in MOCK_FORECASTS if f["status"] == "completed"]),
        "total_data_points": sum(d["row_count"] for d in MOCK_DATASETS),
        "average_accuracy": sum(f["accuracy"] for f in MOCK_FORECASTS) / len(MOCK_FORECASTS),
        "datasets_change": 15,
        "forecasts_change": 8,
        "data_points_change": 12500,
        "accuracy_change": 2.3
    }

def generate_dataset_analytics(dataset_id):
    """Generate mock analytics for a dataset"""
    print(f"[DEBUG] Generating analytics for dataset {dataset_id}")
    dataset = next((d for d in MOCK_DATASETS if d["id"] == dataset_id), None)
    if not dataset:
        print(f"[DEBUG] Dataset {dataset_id} not found")
        return None
    
    print(f"[DEBUG] Found dataset: {dataset['name']}")
    # Generate summary statistics
    summary = {}
    numeric_columns = [col for col in dataset["columns"] if col["type"] in ["number", "integer"]]
    print(f"[DEBUG] Numeric columns: {[col['name'] for col in numeric_columns]}")
    
    for col in numeric_columns:
        summary[col["name"]] = {
            "mean": round(random.uniform(50, 100), 2),
            "std": round(random.uniform(10, 30), 2),
            "min": round(random.uniform(0, 20), 2),
            "max": round(random.uniform(150, 200), 2),
            "null_count": random.randint(0, 10)
        }
    
    # Generate correlations
    correlations = {}
    for col1 in numeric_columns:
        correlations[col1["name"]] = {}
        for col2 in numeric_columns:
            if col1["name"] == col2["name"]:
                correlations[col1["name"]][col2["name"]] = 1.0
            else:
                correlations[col1["name"]][col2["name"]] = round(random.uniform(-0.8, 0.8), 3)
    
    # Generate time series data
    time_series = []
    for i in range(30):
        date = datetime.datetime.now() - datetime.timedelta(days=30-i)
        point = {
            "date": date.isoformat() + "Z"
        }
        for col in numeric_columns[:3]:  # Limit to 3 columns for visualization
            point[col["name"]] = round(random.uniform(20, 100) + random.uniform(-20, 20), 2)
        time_series.append(point)
    
    result = {
        "summary": summary,
        "correlations": correlations,
        "time_series": time_series
    }
    print(f"[DEBUG] Generated analytics successfully")
    return result

def generate_sample_data(data_type, rows=100, start_date='2023-01-01', end_date='2023-12-31'):
    """Generate sample data based on type"""
    start = datetime.datetime.strptime(start_date, '%Y-%m-%d')
    end = datetime.datetime.strptime(end_date, '%Y-%m-%d')
    date_range = [(start + datetime.timedelta(days=x)).strftime('%Y-%m-%d') 
                  for x in range((end - start).days + 1)]
    
    # Sample from date range if more dates than rows needed
    if len(date_range) > rows:
        date_range = random.sample(date_range, rows)
    
    data = []
    
    if data_type == 'sales':
        for i, date in enumerate(date_range[:rows]):
            base_sales = 10000 + 2000 * np.sin(2 * np.pi * i / 365) + random.gauss(0, 1000)
            data.append({
                'date': date,
                'sales': max(0, base_sales),
                'region': random.choice(['North', 'South', 'East', 'West']),
                'product': random.choice(['Product A', 'Product B', 'Product C']),
                'quantity': random.randint(50, 500)
            })
    
    elif data_type == 'temperature':
        for i, date in enumerate(date_range[:rows]):
            base_temp = 15 + 10 * np.sin(2 * np.pi * i / 365) + random.gauss(0, 3)
            data.append({
                'date': date,
                'temperature': round(base_temp, 1),
                'humidity': random.randint(30, 90),
                'pressure': random.uniform(1000, 1030),
                'wind_speed': random.uniform(0, 25)
            })
    
    elif data_type == 'stock':
        price = 100
        for i, date in enumerate(date_range[:rows]):
            price += random.gauss(0, 2)
            price = max(10, price)  # Prevent negative prices
            data.append({
                'date': date,
                'price': round(price, 2),
                'volume': random.randint(1000000, 10000000),
                'high': round(price * random.uniform(1.0, 1.05), 2),
                'low': round(price * random.uniform(0.95, 1.0), 2),
                'open': round(price + random.gauss(0, 1), 2)
            })
    
    elif data_type == 'website_traffic':
        for i, date in enumerate(date_range[:rows]):
            base_traffic = 5000 + 1000 * (i % 7 < 5) + random.gauss(0, 500)  # Weekday effect
            data.append({
                'date': date,
                'visitors': max(0, int(base_traffic)),
                'pageviews': max(0, int(base_traffic * random.uniform(2, 5))),
                'bounce_rate': round(random.uniform(0.3, 0.7), 2),
                'avg_session_duration': round(random.uniform(120, 600), 1)
            })
    
    # Create dataset metadata
    dataset_id = str(random.randint(1000, 9999))
    
    # Define columns based on data type
    columns = []
    if data_type == 'sales':
        columns = [
            {"name": "date", "type": "datetime"},
            {"name": "sales", "type": "number"},
            {"name": "region", "type": "string"},
            {"name": "product", "type": "string"},
            {"name": "quantity", "type": "integer"},
            {"name": "revenue", "type": "number"}
        ]
    elif data_type == 'temperature':
        columns = [
            {"name": "date", "type": "datetime"},
            {"name": "temperature", "type": "number"},
            {"name": "humidity", "type": "integer"},
            {"name": "pressure", "type": "number"},
            {"name": "wind_speed", "type": "number"}
        ]
    elif data_type == 'stock':
        columns = [
            {"name": "date", "type": "datetime"},
            {"name": "price", "type": "number"},
            {"name": "volume", "type": "integer"},
            {"name": "high", "type": "number"},
            {"name": "low", "type": "number"},
            {"name": "open", "type": "number"}
        ]
    elif data_type == 'website_traffic':
        columns = [
            {"name": "date", "type": "datetime"},
            {"name": "visitors", "type": "integer"},
            {"name": "pageviews", "type": "integer"},
            {"name": "bounce_rate", "type": "number"},
            {"name": "avg_session_duration", "type": "number"}
        ]
    
    dataset = {
        'id': dataset_id,
        'name': f'{data_type.replace("_", " ").title()} Sample Data',
        'description': f'Generated sample {data_type} data for demonstration',
        'file_type': 'json',
        'row_count': len(data),
        'column_count': len(data[0]) if data else 0,
        'file_size': len(json.dumps(data)),
        'status': 'active',
        'created_at': datetime.datetime.now().isoformat() + 'Z',
        'updated_at': datetime.datetime.now().isoformat() + 'Z',
        'columns': columns,
        'data': data[:10],  # Return first 10 rows for preview
        'rows': len(data)
    }
    
    return dataset

class MockAPIHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        query = parse_qs(parsed.query)
        
        # Handle export endpoints without CORS headers (for file downloads)
        if "/export" in path:
            try:
                # Handle dataset export: GET /api/v1/datasets/{id}/export?format=csv|json|xlsx
                dataset_id = path.split("/")[4]
                parsed = urlparse(self.path)
                query_params = parse_qs(parsed.query)
                export_format = query_params.get('format', ['csv'])[0]
                
                dataset = next((d for d in MOCK_DATASETS if d["id"] == dataset_id), None)
                if not dataset:
                    self.send_response(404)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": "Dataset not found"}).encode())
                    return
                
                # Generate mock export data based on format
                if export_format == 'csv':
                    # Generate CSV content
                    csv_data = f"id,name,value,date\n"
                    for i in range(min(100, dataset.get('row_count', 10))):
                        csv_data += f"{i+1},Sample Item {i+1},{random.randint(10, 1000)},{datetime.date.today() - datetime.timedelta(days=i)}\n"
                    
                    self.send_response(200)
                    self.send_header('Content-Type', 'text/csv')
                    self.send_header('Content-Disposition', f'attachment; filename="{dataset["name"].replace(" ", "_")}.csv"')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(csv_data.encode())
                    
                elif export_format == 'json':
                    # Generate JSON content
                    json_data = []
                    for i in range(min(100, dataset.get('row_count', 10))):
                        json_data.append({
                            "id": i+1,
                            "name": f"Sample Item {i+1}",
                            "value": random.randint(10, 1000),
                            "date": str(datetime.date.today() - datetime.timedelta(days=i))
                        })
                    
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.send_header('Content-Disposition', f'attachment; filename="{dataset["name"].replace(" ", "_")}.json"')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(json.dumps(json_data, indent=2).encode())
                    
                elif export_format == 'xlsx':
                    # For Excel, return a simplified format (would need openpyxl in real implementation)
                    self.send_response(501)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": "Excel export not implemented in mock server"}).encode())
                else:
                    self.send_response(400)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": "Unsupported export format"}).encode())
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode())
            return
        
        # For all other endpoints, handle them directly
        try:
            if path == "/api/v1/datasets":
                self.send_json_response(MOCK_DATASETS)
            
            elif path.startswith("/api/v1/datasets/") and path.endswith("/preview"):
                dataset_id = path.split("/")[4]
                page = int(query.get("page", [1])[0])
                limit = int(query.get("limit", [50])[0])
                
                data = generate_sample_data(dataset_id, limit)
                dataset = next((d for d in MOCK_DATASETS if d["id"] == dataset_id), None)
                
                response = {
                    "records": data,
                    "total": dataset["row_count"] if dataset else 0,
                    "columns": dataset["columns"] if dataset else []
                }
                self.send_json_response(response)
            
            elif path.startswith("/api/v1/datasets/") and "/analytics" in path:
                dataset_id = path.split("/")[4]
                analytics = generate_dataset_analytics(dataset_id)
                if analytics:
                    self.send_json_response(analytics)
                else:
                    self.send_error_response(404, "Dataset not found")
            
            elif path.startswith("/api/v1/datasets/") and "/export" in path:
                # Handle dataset export: GET /api/v1/datasets/{id}/export?format=csv|json|xlsx
                dataset_id = path.split("/")[4]
                parsed = urlparse(self.path)
                query_params = parse_qs(parsed.query)
                export_format = query_params.get('format', ['csv'])[0]
                
                dataset = next((d for d in MOCK_DATASETS if d["id"] == dataset_id), None)
                if not dataset:
                    self.send_error_response(404, "Dataset not found")
                    return
                
                # Generate mock export data based on format
                if export_format == 'csv':
                    # Generate CSV content
                    csv_data = f"id,name,value,date\n"
                    for i in range(min(100, dataset.get('row_count', 10))):
                        csv_data += f"{i+1},Sample Item {i+1},{random.randint(10, 1000)},{datetime.date.today() - datetime.timedelta(days=i)}\n"
                    
                    self.send_response(200)
                    self.send_header('Content-Type', 'text/csv')
                    self.send_header('Content-Disposition', f'attachment; filename="{dataset["name"]}.csv"')
                    self.end_headers()
                    self.wfile.write(csv_data.encode())
                    
                elif export_format == 'json':
                    # Generate JSON content
                    json_data = []
                    for i in range(min(100, dataset.get('row_count', 10))):
                        json_data.append({
                            "id": i+1,
                            "name": f"Sample Item {i+1}",
                            "value": random.randint(10, 1000),
                            "date": str(datetime.date.today() - datetime.timedelta(days=i))
                        })
                    
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.send_header('Content-Disposition', f'attachment; filename="{dataset["name"]}.json"')
                    self.end_headers()
                    self.wfile.write(json.dumps(json_data, indent=2).encode())
                    
                elif export_format == 'xlsx':
                    # For Excel, return a simplified format (would need openpyxl in real implementation)
                    self.send_error_response(501, "Excel export not implemented in mock server")
                else:
                    self.send_error_response(400, "Unsupported export format")
            
            elif path.startswith("/api/v1/datasets/") and not "/analytics" in path and not "/preview" in path and not "/export" in path:
                dataset_id = path.split("/")[4]
                dataset = next((d for d in MOCK_DATASETS if d["id"] == dataset_id), None)
                if dataset:
                    self.send_json_response(dataset)
                else:
                    self.send_error_response(404, "Dataset not found")
            
            elif path == "/api/v1/analytics/summary":
                self.send_json_response(generate_analytics_summary())
            
            elif path == "/api/v1/analytics/forecasts/recent":
                self.send_json_response(MOCK_FORECASTS)
            
            elif path == "/api/v1/analytics/models/stats":
                stats = [
                    {
                        "model_type": "linear_regression",
                        "total_forecasts": 5,
                        "average_accuracy": 84.2,
                        "average_mse": 0.025,
                        "success_rate": 95.0
                    },
                    {
                        "model_type": "arima", 
                        "total_forecasts": 3,
                        "average_accuracy": 91.5,
                        "average_mse": 0.018,
                        "success_rate": 88.0
                    },
                    {
                        "model_type": "moving_average",
                        "total_forecasts": 4, 
                        "average_accuracy": 76.8,
                        "average_mse": 0.032,
                        "success_rate": 100.0
                    }
                ]
                self.send_json_response(stats)
            
            elif path == "/api/v1/analytics/models/compare":
                comparison = [
                    {
                        "model_type": "linear_regression",
                        "accuracy": 84.2,
                        "mse": 0.025,
                        "mae": 0.135,
                        "rmse": 0.158,
                        "count": 5
                    },
                    {
                        "model_type": "arima",
                        "accuracy": 91.5, 
                        "mse": 0.018,
                        "mae": 0.105,
                        "rmse": 0.134,
                        "count": 3
                    },
                    {
                        "model_type": "moving_average",
                        "accuracy": 76.8,
                        "mse": 0.032,
                        "mae": 0.165,
                        "rmse": 0.179,
                        "count": 4
                    }
                ]
                self.send_json_response(comparison)
            
            elif path.startswith("/api/v1/sample-data/"):
                data_type = path.split("/")[-1]
                rows = int(query.get("rows", [100])[0])
                start_date = query.get("start_date", ['2023-01-01'])[0]
                end_date = query.get("end_date", ['2023-12-31'])[0]
                
                # Generate sample data based on type
                dataset = generate_sample_data(data_type, rows, start_date, end_date)
                self.send_json_response(dataset)
            
            elif path == "/api/v1/auth/me":
                # Mock current user endpoint
                # Return a mock user for any request with Authorization header
                auth_header = self.headers.get('Authorization', '')
                if auth_header.startswith('Bearer '):
                    mock_user = {
                        "id": "1",
                        "username": "demo_user",
                        "email": "demo@insightdash.com",
                        "full_name": "Demo User",
                        "role": "user",
                        "created_at": "2024-01-01T00:00:00Z"
                    }
                    self.send_json_response(mock_user)
                else:
                    self.send_error_response(401, "Not authenticated")
            
            elif path == "/":
                # Root endpoint - provide API status
                self.send_json_response({
                    "status": "success",
                    "message": "Mock API server is running",
                    "available_endpoints": [
                        "/api/v1/datasets",
                        "/api/v1/datasets/{id}",
                        "/api/v1/datasets/{id}/preview",
                        "/api/v1/datasets/{id}/analytics",
                        "/api/v1/analytics/summary",
                        "/api/v1/analytics/forecasts/recent",
                        "/api/v1/analytics/models/stats",
                        "/api/v1/analytics/models/compare",
                        "/api/v1/auth/me",
                        "/api/v1/sample-data/{type}"
                    ]
                })
            
            else:
                self.send_error_response(404, "Endpoint not found")
                
        except Exception as e:
            self.send_error_response(500, str(e))
    
    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path
        
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            
            if path == "/api/v1/analytics/forecast":
                # Parse forecast request
                if content_length > 0:
                    data = json.loads(post_data.decode())
                else:
                    data = {}
                
                # Create mock forecast
                forecast_id = f"f{len(MOCK_FORECASTS) + 1}"
                dataset = next((d for d in MOCK_DATASETS if d["id"] == data.get("dataset_id")), MOCK_DATASETS[0])
                
                new_forecast = {
                    "id": forecast_id,
                    "dataset_id": data.get("dataset_id", "1"),
                    "dataset_name": dataset["name"],
                    "model_type": data.get("model_type", "linear_regression"),
                    "target_column": data.get("target_column", "value"),
                    "date_column": data.get("date_column", "date"),
                    "horizon": data.get("horizon", 30),
                    "accuracy": round(random.uniform(75, 95), 1),
                    "mse": round(random.uniform(0.01, 0.05), 4),
                    "mae": round(random.uniform(0.08, 0.20), 3),
                    "rmse": round(random.uniform(0.10, 0.25), 3),
                    "created_at": datetime.datetime.now().isoformat() + "Z",
                    "status": "completed"
                }
                
                MOCK_FORECASTS.append(new_forecast)
                self.send_json_response(new_forecast)
            
            elif path == "/api/v1/demo/generate-data":
                # Parse data generation request
                if content_length > 0:
                    data = json.loads(post_data.decode())
                else:
                    data = {}
                
                # Generate sample data
                dataset = generate_sample_data(
                    data.get('type', 'sales'),
                    data.get('rows', 100),
                    data.get('start_date', '2023-01-01'),
                    data.get('end_date', '2023-12-31')
                )
                
                # Add to mock datasets
                MOCK_DATASETS.append(dataset)
                self.send_json_response(dataset)
            
            elif path == "/api/v1/datasets":
                # Create new dataset endpoint
                if content_length > 0:
                    data = json.loads(post_data.decode())
                    
                    # Generate new dataset ID
                    new_id = str(max([int(d["id"]) for d in MOCK_DATASETS] + [0]) + 1)
                    
                    # Create new dataset
                    new_dataset = {
                        "id": new_id,
                        "name": data.get("name", "Untitled Dataset"),
                        "description": data.get("description", ""),
                        "file_type": data.get("file_type", "csv"),
                        "row_count": data.get("row_count", 0),
                        "column_count": data.get("column_count", 0),
                        "file_size": data.get("file_size", 0),
                        "status": "active",
                        "is_public": data.get("is_public", False),
                        "data_source": data.get("data_source", "manual"),
                        "schema_config": data.get("schema_config", {}),
                        "created_at": datetime.datetime.now().isoformat() + "Z",
                        "updated_at": datetime.datetime.now().isoformat() + "Z",
                        "columns": data.get("columns", [])
                    }
                    
                    # Add to mock datasets
                    MOCK_DATASETS.append(new_dataset)
                    
                    print(f"Created new dataset: {new_dataset['name']} (ID: {new_id})")
                    self.send_json_response(new_dataset)
                else:
                    self.send_error_response(400, "Missing request body")
            
            elif path == "/api/v1/auth/login":
                # Mock login endpoint
                if content_length > 0:
                    data = json.loads(post_data.decode())
                else:
                    data = {}
                
                # Simple mock authentication - accept username or email
                username = data.get('username', data.get('email', ''))
                password = data.get('password', '')
                
                # Accept any non-empty credentials for demo
                if username and password:
                    mock_token = f"mock_token_{random.randint(1000, 9999)}"
                    response_data = {
                        "access_token": mock_token,
                        "token_type": "bearer",
                        "user": {
                            "id": "1",
                            "username": username,
                            "email": f"{username}@example.com" if '@' not in username else username,
                            "full_name": username.title(),
                            "role": "user",
                            "created_at": "2024-01-01T00:00:00Z"
                        }
                    }
                    self.send_json_response(response_data)
                else:
                    self.send_error_response(400, "Invalid credentials")
            
            elif path == "/api/v1/auth/register":
                # Mock register endpoint
                if content_length > 0:
                    data = json.loads(post_data.decode())
                else:
                    data = {}
                
                # Simple mock registration
                username = data.get('username', '')
                email = data.get('email', '')
                password = data.get('password', '')
                
                if username and email and password:
                    mock_token = f"mock_token_{random.randint(1000, 9999)}"
                    response_data = {
                        "access_token": mock_token,
                        "token_type": "bearer",
                        "user": {
                            "id": str(random.randint(100, 999)),
                            "username": username,
                            "email": email,
                            "full_name": data.get('full_name', username.title()),
                            "role": "user",
                            "created_at": datetime.datetime.now().isoformat() + "Z"
                        }
                    }
                    self.send_json_response(response_data)
                else:
                    self.send_error_response(400, "Missing required fields")
            
            else:
                self.send_error_response(404, "Endpoint not found")
                
        except Exception as e:
            self.send_error_response(500, str(e))
    
    def do_DELETE(self):
        try:
            path = self.path
            print(f"DELETE request to: {path}")
            
            # Delete dataset: DELETE /api/v1/datasets/{id}
            if path.startswith("/api/v1/datasets/") and "/" not in path[17:]:
                dataset_id = path.split("/")[-1]
                print(f"Attempting to delete dataset with ID: {dataset_id}")
                
                # Find and remove the dataset
                global MOCK_DATASETS
                original_count = len(MOCK_DATASETS)
                MOCK_DATASETS = [d for d in MOCK_DATASETS if d["id"] != dataset_id]
                
                if len(MOCK_DATASETS) < original_count:
                    print(f"Dataset {dataset_id} deleted successfully")
                    response_data = {"message": "Dataset deleted successfully", "id": dataset_id}
                    self.send_json_response(response_data)
                else:
                    print(f"Dataset {dataset_id} not found")
                    self.send_error_response(404, "Dataset not found")
            else:
                self.send_error_response(404, "Endpoint not found")
                
        except Exception as e:
            print(f"Error in DELETE: {str(e)}")
            self.send_error_response(500, str(e))
    
    def do_PUT(self):
        try:
            path = self.path
            print(f"PUT request to: {path}")
            
            # Update dataset: PUT /api/v1/datasets/{id}
            if path.startswith("/api/v1/datasets/") and "/" not in path[17:]:
                dataset_id = path.split("/")[-1]
                print(f"Attempting to update dataset with ID: {dataset_id}")
                
                # Read request body
                content_length = int(self.headers.get('Content-Length', 0))
                if content_length > 0:
                    body = self.rfile.read(content_length)
                    data = json.loads(body.decode('utf-8'))
                    
                    # Find and update the dataset
                    global MOCK_DATASETS
                    dataset_found = False
                    for i, dataset in enumerate(MOCK_DATASETS):
                        if dataset["id"] == dataset_id:
                            # Update dataset fields
                            if "name" in data:
                                MOCK_DATASETS[i]["name"] = data["name"]
                            if "description" in data:
                                MOCK_DATASETS[i]["description"] = data["description"]
                            if "is_public" in data:
                                MOCK_DATASETS[i]["is_public"] = data["is_public"]
                            
                            MOCK_DATASETS[i]["updated_at"] = datetime.datetime.now().isoformat() + "Z"
                            
                            print(f"Dataset {dataset_id} updated successfully")
                            response_data = {
                                "message": "Dataset updated successfully",
                                "dataset": MOCK_DATASETS[i]
                            }
                            self.send_json_response(response_data)
                            dataset_found = True
                            break
                    
                    if not dataset_found:
                        print(f"Dataset {dataset_id} not found")
                        self.send_error_response(404, "Dataset not found")
                else:
                    self.send_error_response(400, "Missing request body")
            else:
                self.send_error_response(404, "Endpoint not found")
                
        except Exception as e:
            print(f"Error in PUT: {str(e)}")
            self.send_error_response(500, str(e))
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()
    
    def send_json_response(self, data):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())
    
    def send_error_response(self, code, message):
        self.send_response(code)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        error_data = {"error": message, "code": code}
        self.wfile.write(json.dumps(error_data).encode())
    
    def log_message(self, format, *args):
        print(f"[{datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {format % args}")

def find_free_port(start_port=8000):
    """Find a free port starting from start_port"""
    for port in range(start_port, start_port + 100):
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.bind(('localhost', port))
                return port
        except OSError:
            continue
    return None

def run_server():
    import os
    port = int(os.environ.get('PORT', 8000))  # Use environment PORT or default to 8000
    server = HTTPServer(('0.0.0.0', port), MockAPIHandler)  # Bind to all interfaces for cloud deployment
    print(f"Mock API server running on http://0.0.0.0:{port}")
    print("Available endpoints:")
    print("  GET  /api/v1/datasets")
    print("  GET  /api/v1/datasets/{id}")
    print("  GET  /api/v1/datasets/{id}/preview")
    print("  GET  /api/v1/datasets/{id}/analytics")
    print("  GET  /api/v1/analytics/summary")
    print("  GET  /api/v1/analytics/forecasts/recent")
    print("  GET  /api/v1/analytics/models/stats")
    print("  GET  /api/v1/analytics/models/compare")
    print("  POST /api/v1/analytics/forecast")
    print("  POST /api/v1/auth/login")
    print("  POST /api/v1/auth/register")
    print("  DELETE /api/v1/datasets/{id}")
    print("  PUT /api/v1/datasets/{id}")
    print("\nPress Ctrl+C to stop the server")
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server...")
        server.shutdown()

if __name__ == "__main__":
    run_server()
