import re
import html


def sanitize_input(value: str) -> str:
    value = html.escape(value)
    value = re.sub(r'<[^>]+>', '', value)
    return value.strip()


def validate_email(email: str) -> bool:
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))
