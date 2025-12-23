from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import smtplib
from email.message import EmailMessage

import time

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

ENV = os.environ.get("ENV", "development")
IS_PROD = ENV == "production"

# --- Admin Token for Founder/Admin Dashboard ---
ADMIN_TOKEN = os.environ.get("ADMIN_TOKEN")

SMTP_HOST = os.environ.get("SMTP_HOST")
SMTP_PORT = int(os.environ.get("SMTP_PORT", "587"))
SMTP_USER = os.environ.get("SMTP_USER")
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD")
NOTIFY_EMAIL = os.environ.get("NOTIFY_EMAIL")  # where leads are sent
EMAIL_ENABLED = all([SMTP_HOST, SMTP_USER, SMTP_PASSWORD, NOTIFY_EMAIL])

def normalize_text(value: str) -> str:
    return value.strip().replace("\n", " ").replace("\r", " ")

# MongoDB connection
mongo_url = os.environ.get("MONGO_URL")
db_name = os.environ.get("DB_NAME")

USE_DB = bool(mongo_url and db_name)

if USE_DB:
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
else:
    client = None
    db = None

def get_collection(name: str):
    if USE_DB:
        return db[name]
    else:
        raise HTTPException(status_code=503, detail="Database not configured")

# Create the main app without a prefix
app = FastAPI()

@app.get("/")
async def root_entry():
    return {
        "service": "nexora-backend",
        "status": "running",
        "env": ENV
    }

# Configure logging
logging.basicConfig(
    level=logging.INFO if IS_PROD else logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# --- Admin Auth Guard ---
def verify_admin(token: str | None):
    if not ADMIN_TOKEN or token != ADMIN_TOKEN:
        raise HTTPException(status_code=401, detail="Unauthorized")

def send_lead_email(subject: str, body: str):
    if not EMAIL_ENABLED:
        logger.info("📭 Email disabled — lead captured without notification")
        return

    msg = EmailMessage()
    msg["From"] = SMTP_USER
    msg["To"] = NOTIFY_EMAIL
    msg["Subject"] = subject
    msg.set_content(body)

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(msg)
        logger.info("📨 Lead notification email sent")
    except Exception as e:
        logger.error(f"❌ Failed to send lead email: {e}")

@app.middleware("http")
async def limit_request_size(request, call_next):
    if request.headers.get("content-length"):
        if int(request.headers["content-length"]) > 10_000:
            raise HTTPException(status_code=413, detail="Request too large")
    return await call_next(request)

@app.middleware("http")
async def log_requests(request, call_next):
    response = await call_next(request)
    logger.info(
        f"{request.method} {request.url.path} → {response.status_code}"
    )
    return response

@app.middleware("http")
async def request_timing(request, call_next):
    start = time.time()
    response = await call_next(request)
    duration = (time.time() - start) * 1000
    logger.debug(
        f"{request.method} {request.url.path} completed in {duration:.1f}ms"
    )
    return response

# Create a router with the /api prefix
api_router = APIRouter(
    prefix="/api",
    tags=["public"]
)


# Define Models
class ContactForm(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    industry: str
    business_type: str
    name: str
    city: str
    phone: str
    email: EmailStr
    message: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: str = "new"  # new, contacted, converted

class ContactFormCreate(BaseModel):
    industry: str
    business_type: str
    name: str
    city: str
    phone: str
    email: EmailStr
    message: str

class ServiceInquiry(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    phone: Optional[str] = None
    service: str  # Which service they're interested in
    message: Optional[str] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ServiceInquiryCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    service: str
    message: Optional[str] = None

class Newsletter(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    subscribed: bool = True

class NewsletterCreate(BaseModel):
    email: EmailStr

# --- Admin Response Models (UI-safe) ---
class AdminContact(BaseModel):
    id: str
    name: str
    email: EmailStr
    phone: Optional[str]
    industry: str
    business_type: str
    city: str
    message: str
    status: str
    timestamp: datetime

class AdminServiceInquiry(BaseModel):
    id: str
    name: str
    email: EmailStr
    phone: Optional[str]
    service: str
    message: Optional[str]
    timestamp: datetime

# Routes
@api_router.get("/")
async def root():
    return {"message": "Welcome to Nexora API - Reimagined Intelligence"}

@api_router.post("/contact", response_model=ContactForm)
async def create_contact(input: ContactFormCreate):
    """Submit contact form"""
    try:
        contact_dict = {
            k: normalize_text(v) if isinstance(v, str) else v
            for k, v in input.model_dump().items()
        }

        collection = get_collection("contacts")

        # Basic duplicate protection (same email + message within 24h)
        existing = await collection.find_one({
            "email": contact_dict["email"],
            "message": contact_dict["message"]
        })

        if existing:
            raise HTTPException(status_code=409, detail="Duplicate submission detected")

        contact_obj = ContactForm(**contact_dict)
        
        # Convert to dict and serialize datetime to ISO string for MongoDB
        doc = contact_obj.model_dump()
        doc['timestamp'] = doc['timestamp'].isoformat()
        
        await collection.insert_one(doc)

        send_lead_email(
            subject="New Nexora Contact Lead",
            body=f"""
New contact submission:

Name: {contact_obj.name}
Email: {contact_obj.email}
Phone: {contact_obj.phone}
Industry: {contact_obj.industry}
Business Type: {contact_obj.business_type}
City: {contact_obj.city}

Message:
{contact_obj.message}
"""
        )

        return contact_obj
    except Exception as e:
        logger.error(f"Error creating contact: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to submit contact form")

@api_router.get("/contacts", response_model=List[ContactForm])
async def get_contacts():
    """Get all contact submissions"""
    try:
        collection = get_collection("contacts")
        contacts = await collection.find({}, {"_id": 0}).to_list(1000)
        
        # Convert ISO string timestamps back to datetime objects
        for contact in contacts:
            if isinstance(contact['timestamp'], str):
                contact['timestamp'] = datetime.fromisoformat(
                    contact['timestamp']
                ).replace(tzinfo=timezone.utc)
        
        return contacts
    except Exception as e:
        logger.error(f"Error fetching contacts: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch contacts")


# --- Admin: List contacts with status filter ---
from fastapi import Query
@api_router.get(
    "/admin/contacts",
    response_model=List[AdminContact],
    tags=["admin"]
)
async def admin_get_contacts(
    status: Optional[str] = None,
    admin_token: Optional[str] = None
):
    verify_admin(admin_token)

    collection = get_collection("contacts")

    query = {"status": status} if status else {}
    contacts = await collection.find(query, {"_id": 0}).to_list(500)

    for contact in contacts:
        if isinstance(contact["timestamp"], str):
            contact["timestamp"] = datetime.fromisoformat(
                contact["timestamp"]
            ).replace(tzinfo=timezone.utc)

    return contacts


# --- Admin: Update contact status (new → contacted → converted) ---
@api_router.patch(
    "/admin/contacts/{contact_id}/status",
    tags=["admin"]
)
async def update_contact_status(
    contact_id: str,
    status: str,
    admin_token: Optional[str] = None
):
    verify_admin(admin_token)

    if status not in {"new", "contacted", "converted"}:
        raise HTTPException(status_code=400, detail="Invalid status")

    collection = get_collection("contacts")

    result = await collection.update_one(
        {"id": contact_id},
        {"$set": {"status": status}}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Contact not found")

    return {"ok": True, "status": status}


# --- Admin: List service inquiries ---
@api_router.get(
    "/admin/service-inquiries",
    response_model=List[AdminServiceInquiry],
    tags=["admin"]
)
async def admin_get_service_inquiries(admin_token: Optional[str] = None):
    verify_admin(admin_token)

    collection = get_collection("service_inquiries")

    inquiries = await collection.find({}, {"_id": 0}).to_list(500)

    for inquiry in inquiries:
        if isinstance(inquiry["timestamp"], str):
            inquiry["timestamp"] = datetime.fromisoformat(
                inquiry["timestamp"]
            ).replace(tzinfo=timezone.utc)

    return inquiries

@api_router.post("/service-inquiry", response_model=ServiceInquiry)
async def create_service_inquiry(input: ServiceInquiryCreate):
    """Submit service inquiry"""
    try:
        inquiry_dict = {
            k: normalize_text(v) if isinstance(v, str) else v
            for k, v in input.model_dump().items()
        }
        inquiry_obj = ServiceInquiry(**inquiry_dict)
        
        collection = get_collection("service_inquiries")

        doc = inquiry_obj.model_dump()
        doc['timestamp'] = doc['timestamp'].isoformat()
        
        await collection.insert_one(doc)

        send_lead_email(
            subject=f"New Nexora Service Inquiry — {inquiry_obj.service}",
            body=f"""
New service inquiry:

Name: {inquiry_obj.name}
Email: {inquiry_obj.email}
Phone: {inquiry_obj.phone or "—"}
Service: {inquiry_obj.service}

Message:
{inquiry_obj.message or "—"}
"""
        )

        return inquiry_obj
    except Exception as e:
        logger.error(f"Error creating service inquiry: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to submit inquiry")

@api_router.post("/newsletter", response_model=Newsletter)
async def subscribe_newsletter(input: NewsletterCreate):
    """Subscribe to newsletter"""
    try:
        collection = get_collection("newsletters")
        # Check if email already exists
        existing = await collection.find_one({"email": input.email}, {"_id": 0})
        if existing:
            raise HTTPException(status_code=400, detail="Email already subscribed")
        
        newsletter_dict = input.model_dump()
        newsletter_obj = Newsletter(**newsletter_dict)
        
        doc = newsletter_obj.model_dump()
        doc['timestamp'] = doc['timestamp'].isoformat()
        
        await collection.insert_one(doc)
        return newsletter_obj
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error subscribing to newsletter: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to subscribe")

@api_router.get("/stats")
async def get_stats():
    """Get basic statistics"""
    try:
        contacts_collection = get_collection("contacts")
        inquiries_collection = get_collection("service_inquiries")
        newsletters_collection = get_collection("newsletters")

        total_contacts = await contacts_collection.count_documents({})
        total_inquiries = await inquiries_collection.count_documents({})
        total_subscribers = await newsletters_collection.count_documents({})

        latest_contact = await contacts_collection.find_one(
            {},
            sort=[("timestamp", -1)],
            projection={"_id": 0, "timestamp": 1}
        )
        
        return {
            "total_contacts": total_contacts,
            "total_inquiries": total_inquiries,
            "total_subscribers": total_subscribers,
            "latest_contact_at": latest_contact["timestamp"] if latest_contact else None
        }
    except Exception as e:
        logger.error(f"Error fetching stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch stats")

@api_router.get("/health")
async def health_check():
    if not USE_DB:
        return {
            "status": "ok",
            "database": "in-memory (development)",
            "service": "nexora-backend-dev"
        }

    try:
        await client.admin.command("ping")
        return {
            "status": "ok",
            "database": "connected",
            "service": "nexora-backend"
        }
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        raise HTTPException(status_code=503, detail="Database unavailable")


# ---- CORS CONFIG (PRODUCTION SAFE) ----
cors_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://nexorair.com",
    "https://www.nexorair.com",
]

# Optional: extend from environment variable if provided
cors_origins_env = os.environ.get("CORS_ORIGINS")
if cors_origins_env:
    cors_origins.extend(
        [origin.strip() for origin in cors_origins_env.split(",") if origin.strip()]
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the router in the main app
app.include_router(api_router)

@app.on_event("startup")
async def startup_check():
    if not USE_DB:
        logger.warning("⚠️ Nexora backend started WITHOUT database (dev mode)")
        return

    try:
        await client.admin.command("ping")
        logger.info(
            f"✅ Nexora backend started | env={ENV} | db=connected"
        )
    except Exception as e:
        logger.error(f"❌ MongoDB connection failed on startup: {e}")
        raise

@app.on_event("shutdown")
async def shutdown_db_client():
    logger.info("⏳ Shutting down Nexora backend")
    if client:
        client.close()