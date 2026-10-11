import logging
import re
import sys


from typing import Any, Dict, List, Tuple


class SensitiveDataFilter(logging.Filter):
    """
    Filter to sanitize sensitive patterns (passwords, JWT tokens, Bearer headers,
    API keys, payment card numbers, CVV/PINs, credentials in connection strings)
    from log records (both record.msg and record.args/exc_text) to prevent credentials
    or cardholder data leaks in application logs.
    """
    BEARER_PATTERN = re.compile(
        r"(Bearer\s+)[A-Za-z0-9\-_=]+\.[A-Za-z0-9\-_=]+\.?[A-Za-z0-9\-_.+/=]*",
        re.IGNORECASE,
    )
    JWT_PATTERN = re.compile(
        r"\beyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_.-]*\b"
    )
    KEY_PATTERN = re.compile(
        r"(['\"]?(?:password|passwd|pwd|confirm_password|access_token|refresh_token|secret_key|secret|api_key|service_role_key|jwt_secret|card_number|card|cvv|cvc|pin|private_key)['\"]?\s*[:=]\s*['\"])[^'\"]+(['\"])",
        re.IGNORECASE,
    )
    URL_CREDENTIAL_PATTERN = re.compile(
        r"(://[^:\s]+):([^@\s]+)@",
        re.IGNORECASE,
    )
    SUPABASE_KEY_PATTERN = re.compile(
        r"\bsbp_[a-zA-Z0-9_-]{20,}\b"
    )

    def sanitize_text(self, text: str) -> str:
        """Sanitize sensitive patterns from a string."""
        if not isinstance(text, str):
            return text
        text = self.BEARER_PATTERN.sub(r"\1[REDACTED]", text)
        text = self.KEY_PATTERN.sub(r"\1[REDACTED]\2", text)
        text = self.JWT_PATTERN.sub("[REDACTED_JWT]", text)
        text = self.URL_CREDENTIAL_PATTERN.sub(r"\1:[REDACTED]@", text)
        text = self.SUPABASE_KEY_PATTERN.sub("[REDACTED_KEY]", text)
        return text

    def _sanitize_value(self, val: Any) -> Any:
        """Recursively sanitize data values within args or dictionaries."""
        if isinstance(val, str):
            return self.sanitize_text(val)
        elif isinstance(val, dict):
            sanitized_dict: Dict[str, Any] = {}
            for k, v in val.items():
                if isinstance(k, str) and any(
                    s in k.lower() for s in ["password", "token", "secret", "cvv", "key", "pwd"]
                ):
                    sanitized_dict[k] = "[REDACTED]"
                else:
                    sanitized_dict[k] = self._sanitize_value(v)
            return sanitized_dict
        elif isinstance(val, (list, tuple)):
            items = [self._sanitize_value(v) for v in val]
            return tuple(items) if isinstance(val, tuple) else items
        return val

    def filter(self, record: logging.LogRecord) -> bool:
        if isinstance(record.msg, str):
            record.msg = self.sanitize_text(record.msg)

        if record.args:
            if isinstance(record.args, tuple):
                record.args = tuple(self._sanitize_value(arg) for arg in record.args)
            elif isinstance(record.args, dict):
                record.args = {k: self._sanitize_value(v) for k, v in record.args.items()}

        if record.exc_text and isinstance(record.exc_text, str):
            record.exc_text = self.sanitize_text(record.exc_text)

        return True


def setup_logging(log_level: str = "INFO") -> logging.Logger:
    """Configures application-wide logging with safety filters."""
    logger = logging.getLogger("storyhour")
    logger.setLevel(getattr(logging, log_level.upper(), logging.INFO))

    # Avoid duplicate handlers on reload
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setLevel(getattr(logging, log_level.upper(), logging.INFO))
        formatter = logging.Formatter(
            fmt="%(asctime)s [%(levelname)s] [%(name)s] %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        )
        handler.setFormatter(formatter)
        handler.addFilter(SensitiveDataFilter())
        logger.addHandler(handler)

    return logger


logger = setup_logging()
