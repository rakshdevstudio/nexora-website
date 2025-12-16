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


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


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

# Routes
@api_router.get("/")
async def root():
    return {"message": "Welcome to Nexora API - Reimagined Intelligence"}

@api_router.post("/contact", response_model=ContactForm)
async def create_contact(input: ContactFormCreate):
    """Submit contact form"""
    try:
        contact_dict = input.model_dump()
        contact_obj = ContactForm(**contact_dict)
        
        # Convert to dict and serialize datetime to ISO string for MongoDB
        doc = contact_obj.model_dump()
        doc['timestamp'] = doc['timestamp'].isoformat()
        
        await db.contacts.insert_one(doc)
        return contact_obj
    except Exception as e:
        logger.error(f"Error creating contact: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to submit contact form")

@api_router.get("/contacts", response_model=List[ContactForm])
async def get_contacts():
    """Get all contact submissions"""
    try:
        contacts = await db.contacts.find({}, {"_id": 0}).to_list(1000)
        
        # Convert ISO string timestamps back to datetime objects
        for contact in contacts:
            if isinstance(contact['timestamp'], str):
                contact['timestamp'] = datetime.fromisoformat(contact['timestamp'])
        
        return contacts
    except Exception as e:
        logger.error(f"Error fetching contacts: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch contacts")

@api_router.post("/service-inquiry", response_model=ServiceInquiry)
async def create_service_inquiry(input: ServiceInquiryCreate):
    """Submit service inquiry"""
    try:
        inquiry_dict = input.model_dump()
        inquiry_obj = ServiceInquiry(**inquiry_dict)
        
        doc = inquiry_obj.model_dump()
        doc['timestamp'] = doc['timestamp'].isoformat()
        
        await db.service_inquiries.insert_one(doc)
        return inquiry_obj
    except Exception as e:
        logger.error(f"Error creating service inquiry: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to submit inquiry")

@api_router.post("/newsletter", response_model=Newsletter)
async def subscribe_newsletter(input: NewsletterCreate):
    """Subscribe to newsletter"""
    try:
        # Check if email already exists
        existing = await db.newsletters.find_one({"email": input.email}, {"_id": 0})
        if existing:
            raise HTTPException(status_code=400, detail="Email already subscribed")
        
        newsletter_dict = input.model_dump()
        newsletter_obj = Newsletter(**newsletter_dict)
        
        doc = newsletter_obj.model_dump()
        doc['timestamp'] = doc['timestamp'].isoformat()
        
        await db.newsletters.insert_one(doc)
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
        total_contacts = await db.contacts.count_documents({})
        total_inquiries = await db.service_inquiries.count_documents({})
        total_subscribers = await db.newsletters.count_documents({})
        
        return {
            "total_contacts": total_contacts,
            "total_inquiries": total_inquiries,
            "total_subscribers": total_subscribers
        }
    except Exception as e:
        logger.error(f"Error fetching stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch stats")

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()