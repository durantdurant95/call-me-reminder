"""
Vapi service for making AI-powered phone calls.

Integrates with Vapi API to trigger reminder calls.
"""

import httpx
import logging
from typing import Dict, Any, Optional
from app.core.config import settings

logger = logging.getLogger(__name__)


class VapiService:
    """
    Service for interacting with Vapi API.
    
    Vapi provides AI-powered voice calls that can speak
    custom messages to users.
    """
    
    def __init__(self):
        self.api_key = settings.VAPI_API_KEY
        self.base_url = settings.VAPI_BASE_URL
        self.phone_number_id = settings.VAPI_PHONE_NUMBER_ID
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
    
    async def create_call(
        self, 
        phone_number: str, 
        message: str,
        reminder_id: str,
        title: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Initiate a phone call using Vapi.
        
        Args:
            phone_number: E.164 formatted phone number (e.g., +1234567890)
            message: Message to be spoken
            reminder_id: ID for tracking purposes
            title: Optional reminder title for logging
            
        Returns:
            Dictionary with call details including call_id and status
            
        Raises:
            Exception: If API call fails
        """
        try:
            # Construct the full message with greeting
            full_message = f"Hello! This is your reminder: {message}"
            
            payload = {
                "phoneNumberId": self.phone_number_id,
                "customer": {
                    "number": phone_number
                },
                "assistant": {
                    "firstMessage": full_message,
                    "model": {
                        "provider": "openai",
                        "model": "gpt-3.5-turbo",
                        "messages": [
                            {
                                "role": "system",
                                "content": "You are a helpful reminder assistant. After delivering the reminder message, briefly confirm the user heard it and say goodbye. Keep the conversation short and friendly."
                            }
                        ]
                    },
                    "voice": {
                        "provider": "11labs",
                        "voiceId": "adam"
                    }
                },
                "metadata": {
                    "reminder_id": reminder_id,
                    "title": title or "Reminder"
                }
            }
            
            # Add webhook URL if configured (for real-time status updates)
            # Note: Some Vapi accounts may not support per-call serverUrl
            # In that case, configure it at account level in Vapi dashboard
            # if settings.VAPI_WEBHOOK_URL:
            #     payload["serverUrl"] = settings.VAPI_WEBHOOK_URL
            #     logger.debug(f"Including webhook URL: {settings.VAPI_WEBHOOK_URL}")
            
            logger.info(f"Initiating Vapi call for reminder {reminder_id} to {phone_number}")
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/call",
                    json=payload,
                    headers=self.headers,
                    timeout=30.0
                )
                response.raise_for_status()
                result = response.json()
                
                logger.info(f"Vapi call created successfully. Call ID: {result.get('id')}")
                return result
                
        except httpx.HTTPStatusError as e:
            logger.error(f"Vapi API error: {e.response.status_code} - {e.response.text}")
            raise Exception(f"Failed to create call: {e.response.text}")
        except httpx.RequestError as e:
            logger.error(f"Network error calling Vapi: {str(e)}")
            raise Exception(f"Network error: {str(e)}")
        except Exception as e:
            logger.error(f"Unexpected error creating call: {str(e)}")
            raise
    
    async def get_call_status(self, call_id: str) -> Dict[str, Any]:
        """
        Get the status of a call.
        
        Args:
            call_id: ID of the call to check
            
        Returns:
            Dictionary with call status information
            
        Raises:
            Exception: If API call fails
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/call/{call_id}",
                    headers=self.headers,
                    timeout=10.0
                )
                response.raise_for_status()
                result = response.json()
                
                logger.debug(f"Call {call_id} status: {result.get('status')}")
                return result
                
        except httpx.HTTPStatusError as e:
            logger.error(f"Error fetching call status: {e.response.status_code}")
            raise Exception(f"Failed to get call status: {e.response.text}")
        except Exception as e:
            logger.error(f"Error getting call status: {str(e)}")
            raise


# Singleton instance
vapi_service = VapiService()
