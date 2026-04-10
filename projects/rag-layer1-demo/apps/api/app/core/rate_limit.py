from slowapi import Limiter
from slowapi.util import get_remote_address


def _get_real_ip(request) -> str:
    """
    Return the effective client IP for rate-limit keying.

    Prefers the first address in X-Forwarded-For (set by a trusted reverse
    proxy such as nginx or Traefik) and falls back to the raw socket address.
    Deploy behind a proxy that strips/overwrites X-Forwarded-For so that
    clients cannot spoof their own IP.
    """
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return get_remote_address(request)


# Global limiter with a conservative default for all endpoints.
limiter = Limiter(key_func=_get_real_ip, default_limits=["200/minute"])

