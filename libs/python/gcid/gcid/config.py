from pydantic_settings import BaseSettings


class Config(BaseSettings):
    gcid_enc_key: str = 'X' * 32
    gcid_hmac_key: str = 'test'
    gcid_location: str = 'localhost'
