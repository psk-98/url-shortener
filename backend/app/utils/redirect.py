import secrets
import string

from app.models.redirect import Redirect


def random_string(min_length: int = 5, max_length: int = 20) -> str:
    length = secrets.randbelow(max_length - min_length + 1) + min_length
    return "".join(secrets.choice(string.ascii_letters) for _ in range(length))


def generate_unique_code(db) -> str:
    while True:
        alias = random_string()

        exists = db.query(Redirect).filter(Redirect.alias == alias).first()

        if not exists:
            return alias
