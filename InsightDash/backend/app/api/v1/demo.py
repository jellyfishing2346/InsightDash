from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Optional
import random
import datetime

router = APIRouter()

class GenerateDataRequest(BaseModel):
    type: Optional[str] = "sales"
    rows: Optional[int] = 100
    start_date: Optional[str] = "2023-01-01"
    end_date: Optional[str] = "2023-12-31"

@router.post("/demo/generate-data")
def generate_data(request: GenerateDataRequest):
    # Simple mock data generator (expand as needed)
    data = []
    for i in range(request.rows):
        row = {
            "id": i + 1,
            "date": (datetime.datetime.strptime(request.start_date, "%Y-%m-%d") + datetime.timedelta(days=i)).strftime("%Y-%m-%d"),
            "value": round(random.uniform(10, 1000), 2),
            "type": request.type
        }
        data.append(row)
    return {
        "name": f"{request.type.title()} Sample Data",
        "rows": request.rows,
        "data": data
    }
