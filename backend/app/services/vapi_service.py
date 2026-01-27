"""
Vapi service for making AI-powered phone calls.

Integrates with Vapi API to trigger reminder calls.
"""

import httpx
from typing import Dict, Any
from app.core.config import settings


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
        reminder_id: str
    ) -> Dict[str, Any]:
        """
        Initiate a phone call using Vapi.
        
        Args:
            phone_number: E.164 formatted phone number
            message: Message to be spoken
            reminder_id: ID for tracking purposes
            
        Returns:
            Dictionary with call details including call_id and status
            
        Raises:
            httpx.HTTPError: If API call fails
        """
        # TODO: Implement actual Vapi API call
        # This is a placeholder showing the expected structure
        
        payload = {
            "phoneNumberId": self.phone_number_id,
            "customer": {
                "number": phone_number
            },
            "assistant": {
                "firstMessage": message,
                "model": {
                    "provider": "openai",
                    "model": "gpt-3.5-turbo"
                },
                "voice": {
                    "provider": "11labs",
                    "voiceId": "adam"
                }
            },
            "metadata": {
                "reminder_id": reminder_id
            }
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/call",
                json=payload,
                headers=self.headers,
                timeout=30.0
            )
            response.raise_for_status()
            return response.json()
    
    async def get_call_status(self, call_id: str) -> Dict[str, Any]:
        """
        Get the status of a call.
        
        Args:
            call_id: ID of the call to check
            
        Returns:
            Dictionary with call status information
        """
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/call/{call_id}",
                headers=self.headers,
                timeout=10.0
            )
            response.raise_for_status()
            return response.json()


# Singleton instance
vapi_service = VapiService()
