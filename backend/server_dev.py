from fastapi import FastAPI, APIRouter, HTTPException
from starlette.middleware.cors import CORSMiddleware
from typing import List, Optional, Dict, Any
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from datetime import datetime, timezone
import uuid
import time

ROOT_DIR = Path(__file__).parent
ENV = os.environ.get("ENV", "development")
IS_PROD = ENV == "production"

# --- In-memory storage for development ---
# Note: Data resets on server restart (expected in dev)
memory_db = {
    "contacts": [],
    "service_inquiries": [],
    "newsletters": []
}

# --- Models ---
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
    notes: Optional[str] = None  # internal admin notes
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: str = "new"  # new, contacted, qualified, converted, archived
    updated_at: Optional[datetime] = None

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
    notes: Optional[str] = None
    status: str
    timestamp: datetime
    updated_at: Optional[datetime] = None

class AdminServiceInquiry(BaseModel):
    id: str
    name: str
    email: EmailStr
    phone: Optional[str]
    service: str
    message: Optional[str]
    timestamp: datetime

# --- Admin Token for Founder/Admin Dashboard ---
ADMIN_TOKEN = os.environ.get("ADMIN_TOKEN", "dev-admin-token")

# --- Admin Auth Guard ---
def verify_admin(token: str | None):
    if not ADMIN_TOKEN or token != ADMIN_TOKEN:
        raise HTTPException(status_code=401, detail="Unauthorized")

def normalize_text(value: str) -> str:
    return value.strip().replace("\n", " ").replace("\r", " ")

# Create the main app without a prefix
app = FastAPI()

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

@app.middleware("http")
async def security_headers(request, call_next):
    """Add HTTP security headers to all responses"""
    response = await call_next(request)
    
    # Content-Security-Policy: Base on 'self' with necessary exceptions for:
    # - Google Fonts (fonts.googleapis.com, fonts.gstatic.com)
    # - PostHog analytics (us.i.posthog.com, *.posthog.com)
    # Note: Extends beyond 'default-src self' to maintain compatibility with existing assets
    csp = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://us.i.posthog.com https://*.posthog.com; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "font-src 'self' https://fonts.gstatic.com data:; "
        "img-src 'self' data: https:; "
        "connect-src 'self' https://us.i.posthog.com https://*.posthog.com; "
        "frame-ancestors 'none';"
    )
    
    response.headers["Content-Security-Policy"] = csp
    response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains; preload"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    
    return response

# Create a router with the /api prefix
api_router = APIRouter(
    prefix="/api",
    tags=["public"]
)

# Routes
@api_router.get("/")
async def root():
    return {"message": "Welcome to Nexora API - Reimagined Intelligence (Development Mode)"}

@api_router.post("/contact", response_model=ContactForm)
async def create_contact(input: ContactFormCreate):
    """Submit contact form"""
    try:
        contact_dict = {
            k: normalize_text(v) if isinstance(v, str) else v
            for k, v in input.model_dump().items()
        }

        # Basic duplicate protection (same email + message within 24h)
        existing = next((c for c in memory_db["contacts"] 
                        if c["email"] == contact_dict["email"] and c["message"] == contact_dict["message"]), None)

        if existing:
            raise HTTPException(status_code=409, detail="Duplicate submission detected")

        contact_obj = ContactForm(**contact_dict)
        
        # Convert to dict and serialize datetime to ISO string for storage
        doc = contact_obj.model_dump()
        doc['timestamp'] = doc['timestamp'].isoformat()
        if doc.get('updated_at') and isinstance(doc['updated_at'], datetime):
            doc['updated_at'] = doc['updated_at'].isoformat()
        
        memory_db["contacts"].append(doc)

        logger.info(f"📝 New contact created: {contact_obj.name} ({contact_obj.email})")

        return contact_obj
    except Exception as e:
        logger.error(f"Error creating contact: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to submit contact form")

@api_router.get("/contacts", response_model=List[ContactForm])
async def get_contacts():
    """Get all contact submissions"""
    try:
        contacts = memory_db["contacts"]
        
        # Convert ISO string timestamps back to datetime objects
        for contact in contacts:
            if isinstance(contact['timestamp'], str):
                contact['timestamp'] = datetime.fromisoformat(
                    contact['timestamp']
                ).replace(tzinfo=timezone.utc)
            if contact.get('updated_at') and isinstance(contact['updated_at'], str):
                contact['updated_at'] = datetime.fromisoformat(contact['updated_at']).replace(tzinfo=timezone.utc)
        
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

    query = {"status": status} if status else {}
    contacts = [c for c in memory_db["contacts"] 
                if all(c.get(k) == v for k, v in query.items())]

    for contact in contacts:
        if isinstance(contact["timestamp"], str):
            contact["timestamp"] = datetime.fromisoformat(
                contact["timestamp"]
            ).replace(tzinfo=timezone.utc)
        if contact.get("updated_at") and isinstance(contact["updated_at"], str):
            contact["updated_at"] = datetime.fromisoformat(contact["updated_at"]).replace(tzinfo=timezone.utc)

        # Ensure message is always present (already modeled)

    return contacts

# --- Admin: Update contact status (new → contacted → converted) ---
from fastapi import Body
from fastapi import Request

@api_router.api_route(
    "/admin/contacts/{contact_id}/status",
    methods=["PATCH", "POST"],
    tags=["admin"]
)
async def update_contact_status(
    contact_id: str,
    request: Request,
    admin_token: Optional[str] = None
):
    verify_admin(admin_token)

    payload = await request.json()
    status = payload.get("status")
    if status not in {"new", "contacted", "qualified", "converted", "archived"}:
        raise HTTPException(status_code=400, detail="Invalid status")

    for contact in memory_db["contacts"]:
        if contact["id"] == contact_id:
            contact["status"] = status
            contact["updated_at"] = datetime.now(timezone.utc).isoformat()
            return {"ok": True, "status": status}

    raise HTTPException(status_code=404, detail="Contact not found")

@api_router.post(
    "/admin/contacts/{contact_id}/notes",
    tags=["admin"]
)
async def update_contact_notes(
    contact_id: str,
    payload: Dict[str, Any] = Body(...),
    admin_token: Optional[str] = None
):
    verify_admin(admin_token)

    notes = payload.get("notes")
    if notes is None:
        raise HTTPException(status_code=400, detail="Notes are required")

    for contact in memory_db["contacts"]:
        if contact["id"] == contact_id:
            contact["notes"] = normalize_text(notes)
            contact["updated_at"] = datetime.now(timezone.utc).isoformat()
            return {
                "ok": True,
                "notes": contact["notes"],
                "updated_at": contact["updated_at"]
            }

    raise HTTPException(status_code=404, detail="Contact not found")

# --- Admin: List service inquiries ---
@api_router.get(
    "/admin/service-inquiries",
    response_model=List[AdminServiceInquiry],
    tags=["admin"]
)
async def admin_get_service_inquiries(admin_token: Optional[str] = None):
    verify_admin(admin_token)

    inquiries = memory_db["service_inquiries"]

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
        
        doc = inquiry_obj.model_dump()
        doc['timestamp'] = doc['timestamp'].isoformat()
        
        memory_db["service_inquiries"].append(doc)

        logger.info(f"📝 New service inquiry: {inquiry_obj.service} from {inquiry_obj.name}")

        return inquiry_obj
    except Exception as e:
        logger.error(f"Error creating service inquiry: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to submit inquiry")

@api_router.post("/newsletter", response_model=Newsletter)
async def subscribe_newsletter(input: NewsletterCreate):
    """Subscribe to newsletter"""
    try:
        # Check if email already exists
        existing = next((n for n in memory_db["newsletters"] if n["email"] == input.email), None)
        if existing:
            raise HTTPException(status_code=400, detail="Email already subscribed")
        
        newsletter_dict = input.model_dump()
        newsletter_obj = Newsletter(**newsletter_dict)
        
        doc = newsletter_obj.model_dump()
        doc['timestamp'] = doc['timestamp'].isoformat()
        
        memory_db["newsletters"].append(doc)
        
        logger.info(f"📝 New newsletter subscription: {newsletter_obj.email}")
        
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
        total_contacts = len(memory_db["contacts"])
        total_inquiries = len(memory_db["service_inquiries"])
        total_subscribers = len(memory_db["newsletters"])

        latest_contact = max(memory_db["contacts"], 
                           key=lambda x: x["timestamp"], 
                           default=None)
        
        return {
            "total_contacts": total_contacts,
            "total_inquiries": total_inquiries,
            "total_subscribers": total_subscribers,
            "latest_contact_at": latest_contact["timestamp"] if latest_contact else None,
            "mode": "development (in-memory)"
        }
    except Exception as e:
        logger.error(f"Error fetching stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch stats")

@api_router.get("/admin/stats", tags=["admin"])
async def admin_get_stats(admin_token: Optional[str] = None):
    verify_admin(admin_token)

    return {
        "contacts": len(memory_db["contacts"]),
        "service_inquiries": len(memory_db["service_inquiries"]),
        "newsletter": len(memory_db["newsletters"]),
    }

@api_router.get("/health")
async def health_check():
    try:
        return {
            "status": "ok",
            "database": "in-memory (development)",
            "service": "nexora-backend-dev"
        }
    except Exception:
        raise HTTPException(status_code=503, detail="Service unavailable")

# Include the router in the main app
app.include_router(api_router)

cors_origins_env = os.environ.get("CORS_ORIGINS")

if cors_origins_env:
    cors_origins = [o.strip() for o in cors_origins_env.split(",") if o.strip()]
else:
    # Development-safe defaults
    cors_origins = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://fullstack-future.preview.emergentagent.com",
        "https://*.preview.emergentagent.com",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO if IS_PROD else logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_check():
    logger.info(
        f"✅ Nexora backend started (DEVELOPMENT MODE) | env={ENV} | db=in-memory"
    )

@app.on_event("shutdown")
async def shutdown():
    logger.info("⏳ Shutting down Nexora backend (dev mode)")
