from fastapi import APIRouter, Depends
from pymongo.collection import Collection
from db.db import get_db
from utils.auth_utils import create_access_token, hash_password, verify_password
from model.model import LoginUser, UserCreate, ResetPasswordRequest
from bson import ObjectId

user_router = APIRouter()


@user_router.post("/register")
def create_user(user: UserCreate, db=Depends(get_db)):
    try:
        users_collection: Collection = db["signup"]

        if users_collection.find_one({"email": user.email}):
            return {
                "message": "Email already registered",
                "status": "error",
                "data": None,
            }

        user_hash_password = hash_password(user.password)
        user_doc = {
            "name": user.name,
            "email": user.email,
            "password": user_hash_password,
        }

        result = users_collection.insert_one(user_doc)
        db_user = users_collection.find_one({"_id": result.inserted_id})

        token = create_access_token(
            data={
                "email": db_user["email"],
                "name": db_user["name"],
                "user_id": str(db_user["_id"]),
            }
        )

        return {
            "data": {"name": db_user["name"], "email": db_user["email"], "token": token},
            "message": "User registered successfully",
            "status": "success",
        }
    except Exception as e:
        return {
            "message": f"Registration failed: {str(e)}",
            "status": "error",
            "data": None,
        }


@user_router.post("/login")
def login_user(user: LoginUser, db=Depends(get_db)):
    try:
        users_collection: Collection = db["signup"]

        db_user = users_collection.find_one({"email": user.email})
        if not db_user:
            return {
                "message": "Email not found",
                "status": "error",
                "data": None,
            }

        is_valid_password = verify_password(user.password, db_user["password"])
        if not is_valid_password:
            return {
                "message": "Invalid password",
                "status": "error",
                "data": None,
            }

        token = create_access_token(
            data={
                "email": db_user["email"],
                "name": db_user["name"],
                "user_id": str(db_user["_id"]),
            }
        )

        return {
            "data": {"name": db_user["name"], "email": db_user["email"], "token": token},
            "message": "User logged in successfully",
            "status": "success",
        }
    except Exception as e:
        return {
            "message": f"Login failed: {str(e)}",
            "status": "error",
            "data": None,
        }


@user_router.post("/reset-password")
def reset_password(request: ResetPasswordRequest, db=Depends(get_db)):
    try:
        users_collection: Collection = db["signup"]

        email = request.email.strip().lower()
        user = users_collection.find_one({"email": email})
        if not user:
            return {
                "message": "Email not found",
                "status": "error",
            }

        hashed_pw = hash_password(request.new_password)
        user_id = user.get("_id")
        if not isinstance(user_id, ObjectId):
            try:
                user_id = ObjectId(user_id)
            except Exception:
                user_id = None

        if user_id is None:
            return {
                "message": "Invalid user id",
                "status": "error",
            }

        result = users_collection.update_one(
            {"_id": user_id},
            {"$set": {"password": hashed_pw}},
        )

        if result.modified_count == 0:
            return {
                "message": "Password update failed",
                "status": "error",
            }

        return {
            "message": f"Password has been reset for {email}",
            "status": "success",
        }
    except Exception as e:
        return {
            "message": f"Password reset failed: {str(e)}",
            "status": "error",
        }
