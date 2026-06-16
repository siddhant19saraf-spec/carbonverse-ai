import re
import html


def sanitize_input(value: str) -> str:
    """Strip HTML tags and escape special characters."""
    value = html.escape(value)
    value = re.sub(r"<[^>]+>", "", value)
    return value.strip()
