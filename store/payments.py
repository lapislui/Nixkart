import os
import stripe
from django.conf import settings

# Initialize Stripe with the API key
stripe.api_key = settings.STRIPE_SECRET_KEY

def create_payment_intent(amount, currency='usd', metadata=None):
    """
    Create a PaymentIntent with the order amount and currency
    """
    try:
        # Amount needs to be in cents for Stripe
        amount_in_cents = int(amount * 100)
        
        # Create a PaymentIntent with the order amount and currency
        intent = stripe.PaymentIntent.create(
            amount=amount_in_cents,
            currency=currency,
            metadata=metadata or {},
            # Additional options can be added here
        )
        
        return {
            'success': True,
            'client_secret': intent.client_secret,
            'intent_id': intent.id
        }
    except stripe.error.StripeError as e:
        # Handle Stripe-specific errors
        return {
            'success': False,
            'error': str(e)
        }
    except Exception as e:
        # Handle other errors
        return {
            'success': False,
            'error': str(e)
        }

def retrieve_payment_intent(intent_id):
    """
    Retrieve a PaymentIntent by ID
    """
    try:
        intent = stripe.PaymentIntent.retrieve(intent_id)
        return {
            'success': True,
            'intent': intent
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }