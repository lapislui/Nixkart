from .models import Cart

def cart_count(request):
    """
    Context processor to add cart count to every template
    """
    count = 0
    
    if request.user.is_authenticated:
        try:
            cart = Cart.objects.get(user=request.user)
            count = cart.items.count()
        except Cart.DoesNotExist:
            pass
    else:
        session_id = request.session.session_key
        if session_id:
            try:
                cart = Cart.objects.get(session_id=session_id)
                count = cart.items.count()
            except Cart.DoesNotExist:
                pass
    
    return {'cart_count': count}