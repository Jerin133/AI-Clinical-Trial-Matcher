from pydantic import BaseModel

class Trial(BaseModel):
    trial_name: str
    min_age: int
    max_age: int
    condition: str
    required_marker: str
    description: str