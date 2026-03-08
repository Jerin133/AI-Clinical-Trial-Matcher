import traceback
from utils.auth_utils import get_current_user
from routes.trial_routes import get_recruiter_applicants
from database import trials_collection

try:
    res = trials_collection.find_one({'recruiter_email': {'$exists': True}})
    email = res['recruiter_email'] if res else None
    print(f'Testing with email: {email}')
    print(get_recruiter_applicants(email))
except Exception as e:
    print(traceback.format_exc())
