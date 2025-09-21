# analytics_routes.py
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List
from datetime import datetime, timedelta
from model.model import TotalStudentsResponse, StudentsByDeptResponse, DepartmentCount

# --- DB setup ---
from db.db import get_db
db = get_db()
students_col = db["students"]

# ---------- Core helper functions ----------
def get_total_students() -> int:
    """
    Return total number of students in the campus.
    """
    return students_col.count_documents({})

def get_students_by_department() -> List[dict]:
    """
    Return counts of students grouped by department.
    If department is null/missing, bucket as 'Unknown'.
    """
    pipeline = [
        {
            "$group": {
                "_id": {"$ifNull": ["$department", "Unknown"]},
                "count": {"$sum": 1},
            }
        },
        {"$project": {"_id": 0, "department": "$_id", "count": 1}},
        {"$sort": {"count": -1, "department": 1}},
    ]
    return list(students_col.aggregate(pipeline))


# ---------- Router ----------
analytics_router = APIRouter(prefix="/analytics", tags=["Analytics"])

@analytics_router.get("/total-students", response_model=TotalStudentsResponse)
def total_students_endpoint():
    """
    Get the total number of students enrolled on campus.
    """
    try:
        total = get_total_students()
        return TotalStudentsResponse(
            total_students=total,
            as_of=datetime.utcnow(),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch total students: {str(e)}")

@analytics_router.get("/students-by-department", response_model=StudentsByDeptResponse)
def students_by_department_endpoint():
    """
    Get number of students per department.
    """
    try:
        grouped = get_students_by_department()
        total_students = sum(item["count"] for item in grouped)
        return StudentsByDeptResponse(
            results=[DepartmentCount(**item) for item in grouped],
            total_departments=len(grouped),
            total_students=total_students,
            as_of=datetime.utcnow(),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch students by department: {str(e)}")


@analytics_router.get("/students/recent")
def get_recent_onboarded_students(limit: int = Query(5, ge=1, le=50)):
    """
    Get the most recent onboarded students (default: 5).
    """
    recent_cursor = (
            students_col.find({}, {"_id": 0})
        .sort("created_at", -1)
        .limit(limit)
    )
    recent_students = list(recent_cursor)

    return {
        "count": len(recent_students),   # count from list length
        "students": recent_students
    }


@analytics_router.get("/students/active_last_7_days")
def get_active_students_last_7_days():
    cutoff = datetime.utcnow() - timedelta(days=7)
    active_cursor = students_col.find({"last_active": {"$gte": cutoff}}, {"_id": 0})
    active_students = list(active_cursor)

    return {
        "count": len(active_students),   # instead of active.count(True)
        "students": active_students
    }
