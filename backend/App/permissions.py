from rest_framework.permissions import BasePermission
from .models import Device


class IsValidDevice(BasePermission):
    """
    Authenticates a physical recognition device using an API key sent in
    the X-Device-Key header, matched against Device.api_key — separate
    from user login (email/password + JWT), since devices aren't users.

    On success, attaches the resolved Device instance to request.device
    so views can use it without a second lookup.
    """

    message = "Invalid or missing device API key."

    def has_permission(self, request, view):

        api_key = request.headers.get("X-Device-Key")

        if not api_key:
            return False

        try:
            device = Device.objects.get(api_key=api_key, is_active=True)
        except Device.DoesNotExist:
            return False

        request.device = device

        return True