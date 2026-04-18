print("🚀 NEW BACKEND DEPLOYED WITH CORS FIX")
import os
import re
from datetime import datetime, timezone
from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from pymongo import MongoClient
from pymongo.errors import PyMongoError
from bson import ObjectId
from apscheduler.schedulers.background import BackgroundScheduler
from dotenv import load_dotenv
from ai_service import ai_service
from geopy.distance import geodesic

load_dotenv()

app = Flask(__name__)

CORS(
    app,
    resources={r"/*": {"origins": "*"}},
    supports_credentials=True
)

client = None
db = None
_users_index_ready = False

def get_db():
    global client, db, _users_index_ready

    if db is None:
        mongo_uri = os.getenv("MONGO_URI")
        if not mongo_uri:
            raise RuntimeError("MONGO_URI is not configured.")

        client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000, connect=False)
        db = client["resqmeal"]

    if not _users_index_ready:
        db.users.create_index("email", unique=True)
        _users_index_ready = True

    return db

# Utility: Calculate distance using geopy
def calculate_distance(lat1, lon1, lat2, lon2):
    return round(geodesic((lat1, lon1), (lat2, lon2)).kilometers, 2)

def email_to_name(email):
    local_part = email.split("@")[0].strip()
    cleaned = re.sub(r"[^a-zA-Z0-9]+", " ", local_part).strip()
    if not cleaned:
        return "User"
    return " ".join(word.capitalize() for word in cleaned.split())

def serialize_user(user):
    return {
        "user_id": str(user["_id"]),
        "email": user["email"],
        "role": user["role"],
    }

def get_database_or_response():
    try:
        return get_db(), None
    except (RuntimeError, PyMongoError) as exc:
        return None, (jsonify({"error": f"Database unavailable: {str(exc)}"}), 503)

@app.after_request
def after_request(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET,POST,PUT,DELETE,OPTIONS"
    return response

@app.route('/<path:path>', methods=['OPTIONS'])
def options_handler(path):
    return '', 200

@app.route("/", methods=["GET", "OPTIONS"])
def index():
    return jsonify({"status": "Backend is running", "database": "Connected to MongoDB"}), 200

@app.route("/auth/signup", methods=["POST", "OPTIONS"])
def signup():
    try:
        database, error_response = get_database_or_response()
        if error_response:
            return error_response

        data = request.json or {}
        email = str(data.get("email", "")).strip().lower()
        password = str(data.get("password", ""))
        role = str(data.get("role", "")).strip().lower()

        if not email or not password or not role:
            return jsonify({"error": "Email, password, and role are required."}), 400

        if role not in {"donor", "ngo", "volunteer"}:
            return jsonify({"error": "Role must be 'donor', 'ngo', or 'volunteer'."}), 400

        existing_user = database.users.find_one({"email": email})
        if existing_user:
            return jsonify({"error": "An account with this email already exists."}), 409

        user = {
            "email": email,
            "password": password,
            "role": role,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        result = database.users.insert_one(user)
        user["_id"] = result.inserted_id

        return jsonify({
            "message": "User created successfully.",
            **serialize_user(user),
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/auth/login", methods=["POST", "OPTIONS"])
def login():
    try:
        database, error_response = get_database_or_response()
        if error_response:
            return error_response

        data = request.json or {}
        email = str(data.get("email", "")).strip().lower()
        password = str(data.get("password", ""))

        if not email or not password:
            return jsonify({"error": "Email and password are required."}), 400

        user = database.users.find_one({"email": email})
        if not user:
            return jsonify({"error": "User does not exist."}), 404

        if user.get("password") != password:
            return jsonify({"error": "Incorrect password."}), 401

        return jsonify(serialize_user(user)), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/food/create", methods=["POST", "OPTIONS"])
def create_food():
    try:
        database, error_response = get_database_or_response()
        if error_response:
            return error_response

        data = request.json
        # Generate basic AI recommendation immediately if tags/qty given
        rec = ai_service.get_recommendation(
            distance=2.0, # Placeholder average distance for initial insights
            quantity=data.get('qty', 0),
            time_left=120, # Placeholder
            tags=data.get('tags', [])
        )
        
        insert_data = {
            "title": data['title'],
            "description": data.get('description', ''),
            "qty": data['qty'],
            "type": data['type'],
            "expiry_time": data['expiry_time'],
            "donor_id": data['donor_id'],
            "lat": data['lat'],
            "lng": data['lng'],
            "tags": data.get('tags', []),
            "image": data.get('image', ''),
            "status": 'Urgent' if data.get('is_urgent') else 'Available',
            "ai_status_reason": rec,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        result = database.food_listings.insert_one(insert_data)
        insert_data["_id"] = str(result.inserted_id)
        insert_data["id"] = str(result.inserted_id)
        return jsonify(insert_data), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/food/all", methods=["GET", "OPTIONS"])
def get_all_food():
    try:
        database, error_response = get_database_or_response()
        if error_response:
            return error_response

        items = list(database.food_listings.find().sort("created_at", -1))
        for i in items:
            i["_id"] = str(i["_id"])
            i["id"] = i["_id"]

            user_name = "Unknown User"
            if i.get("donor_id"):
                try:
                    donor_id = i["donor_id"]
                    query = {"_id": ObjectId(donor_id)} if len(str(donor_id)) == 24 else {"id": donor_id}
                    user = database.users.find_one(query)
                    if user:
                        user_name = user.get("name") or email_to_name(user.get("email", ""))
                except Exception:
                    pass

            i["users"] = {"name": user_name}
        return jsonify(items), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/food/nearby", methods=["GET", "OPTIONS"])
def get_nearby():
    try:
        database, error_response = get_database_or_response()
        if error_response:
            return error_response

        lat = float(request.args.get('lat', 0))
        lng = float(request.args.get('lng', 0))
        
        items = list(database.food_listings.find({"status": {"$in": ["Available", "Urgent"]}}))
        
        results = []
        for row in items:
            row["_id"] = str(row["_id"])
            row["id"] = row["_id"]
            
            # Emulate users!inner(name) from Supabase
            user_name = "Unknown User"
            if row.get("donor_id"):
                try:
                    donor_id = row["donor_id"]
                    query = {"_id": ObjectId(donor_id)} if len(str(donor_id)) == 24 else {"id": donor_id}
                    user = database.users.find_one(query)
                    if user:
                        user_name = user.get("name") or email_to_name(user.get("email", ""))
                except Exception:
                    pass
            row["users"] = {"name": user_name}

            dist = calculate_distance(lat, lng, row['lat'], row['lng'])
            row['distanceKm'] = dist
            results.append(row)
            
        # Sort by distance
        results.sort(key=lambda x: x['distanceKm'])
        return jsonify(results), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/food/<id>/claim", methods=["PATCH", "OPTIONS"])
def claim_food(id):
    try:
        database, error_response = get_database_or_response()
        if error_response:
            return error_response

        data = request.json
        ngo_id = data.get('ngo_id')
        
        # Update food status
        database.food_listings.update_one(
            {"_id": ObjectId(id)},
            {"$set": {"status": "Claimed"}}
        )
        
        # Create claim
        claim_data = {
            "food_id": id,
            "ngo_id": ngo_id,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        result = database.claims.insert_one(claim_data)
        
        # We also need to return the updated claim data properly
        claim_data["_id"] = str(result.inserted_id)
        claim_data["id"] = claim_data["_id"]
        return jsonify(claim_data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/food/<id>/status", methods=["PATCH", "OPTIONS"])
def update_status(id):
    try:
        database, error_response = get_database_or_response()
        if error_response:
            return error_response

        status = request.json.get("status")
        database.food_listings.update_one(
            {"_id": ObjectId(id)},
            {"$set": {"status": status}}
        )
        
        # Emulate Supabase returning the updated row
        updated = database.food_listings.find_one({"_id": ObjectId(id)})
        if updated:
            updated["_id"] = str(updated["_id"])
            updated["id"] = updated["_id"]
            return jsonify(updated), 200
        return jsonify({"message": "Updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# Background Scheduler for Expiry AI Analysis
def check_expirations():
    try:
        database, error_response = get_database_or_response()
        if error_response:
            print("Expiry check skipped: database unavailable")
            return

        now = datetime.now(timezone.utc).isoformat()
        # Find active items past expiry
        items = list(database.food_listings.find({
            "status": {"$in": ["Available", "Urgent"]},
            "expiry_time": {"$lt": now}
        }))
        
        for item in items:
            item_id = item["_id"]
            # Mark expired
            database.food_listings.update_one({"_id": item_id}, {"$set": {"status": "Expired"}})
            
            # Analyze why it failed
            # For exact time difference, we can estimate from created_at
            created_str = item.get("created_at", now)
            created = datetime.fromisoformat(created_str)
            expiry = datetime.fromisoformat(item["expiry_time"])
            duration_minutes = max(1, int((expiry - created).total_seconds() / 60))
            
            analysis = ai_service.analyze_expired(
                title=item["title"],
                distance=3.5, # placeholder avg
                quantity=item["qty"],
                time_posted=duration_minutes
            )
            
            # Update DB with AI reason
            database.food_listings.update_one({"_id": item_id}, {"$set": {"ai_status_reason": analysis}})
            print(f"Expired {item['title']} - AI Analysis: {analysis}")
            
    except Exception as e:
        print(f"Expiry check error: {str(e)}")

scheduler = BackgroundScheduler()
scheduler.add_job(func=check_expirations, trigger="interval", minutes=5)
scheduler.start()

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False, use_reloader=False)
