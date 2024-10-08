from pydantic_settings import BaseSettings

class Config(BaseSettings):
    cryptid_enc_key: str = 'X' * 32
    cryptid_hmac_key: str = 'test'
    cryptid_location: str = 'localhost'