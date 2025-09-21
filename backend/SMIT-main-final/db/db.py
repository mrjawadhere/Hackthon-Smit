from pymongo import MongoClient
from dotenv import load_dotenv
import os
load_dotenv()

def get_db():
    try:    
        print("Connecting to MongoDB...")
        print("MONGODB_URI:", os.getenv("db_url"))
        client = MongoClient(os.getenv("db_url"))
        db=client['hackathon_smit']  # <-- specify your database name here
        return db

    except Exception as e:
        print("Error connecting to MongoDB:", e)
        return None
