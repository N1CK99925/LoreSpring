import asyncio
from pwdlib import PasswordHash


password_hash = PasswordHash.recommended()


def _hash_password(password: str) -> str:
    return password_hash.hash(password)


async def hash_password(password: str) -> str:
    return await asyncio.to_thread(_hash_password, password)


def _verify_password(plain_password: str, hashed_password: str) -> bool:
    return password_hash.verify(plain_password, hashed_password)


async def verify_password(plain_password: str, hashed_password: str) -> bool:
    return await asyncio.to_thread(_verify_password, plain_password, hashed_password)
