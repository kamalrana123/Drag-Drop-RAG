from datetime import datetime, timedelta, timezone

import bcrypt
from jose import JWTError, jwt

from app.config import settings


# ── Password helpers ──────────────────────────────────────────────────────────

def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode(), bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())


# ── JWT helpers ───────────────────────────────────────────────────────────────

def create_access_token(subject: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_expire_minutes)
    payload = {"sub": subject, "exp": expire}
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> str | None:
    """Return the subject (user id) or None if the token is invalid/expired."""
    try:
        payload = jwt.decode(
            token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm]
        )
        return payload.get("sub")
    except JWTError:
        return None


# ── API-key encryption (Fernet) ───────────────────────────────────────────────

def _get_fernet():
    from cryptography.fernet import Fernet, InvalidToken  # noqa: F401
    key = settings.encryption_key
    if not key:
        # Generate a stable dev key derived from app secret (not for production)
        import base64, hashlib
        raw = hashlib.sha256(settings.app_secret_key.encode()).digest()
        key = base64.urlsafe_b64encode(raw).decode()
    return Fernet(key.encode() if isinstance(key, str) else key)


def encrypt_api_keys(data: dict) -> str:
    import json
    f = _get_fernet()
    return f.encrypt(json.dumps(data).encode()).decode()


def decrypt_api_keys(token: str) -> dict:
    import json
    f = _get_fernet()
    return json.loads(f.decrypt(token.encode()))
