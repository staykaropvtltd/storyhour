import logging
import re
import sys


class SensitiveDataFilter(logging.Filter):
    """
    Filter to sanitize sensitive patterns (passwords, JWT tokens, Bearer headers, API keys)
    from log records to prevent credentials leaks in production logs.
    """
    BEARER_PATTERN = re.compile(r"(Bearer\s+)[A-Za-z0-9\-_=]+\.[A-Za-z0-9\-_=]+\.?[A-Za-z0-9\-_.+/=]*", re.IGNORECASE)
    KEY_PATTERN = re.compile(r"(['\"]?(?:password|access_token|secret_key|api_key|service_role_key)['\"]?\s*[:=]\s*['\"])[^'\"]+(['\"])", re.IGNORECASE)

    def filter(self, record: logging.LogRecord) -> bool:
        if isinstance(record.msg, str):
            record.msg = self.BEARER_PATTERN.sub(r"\1[REDACTED]", record.msg)
            record.msg = self.KEY_PATTERN.sub(r"\1[REDACTED]\2", record.msg)
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
