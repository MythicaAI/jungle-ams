import itertools
from google.oauth2 import service_account
from googleapiclient.discovery import build

# Path to your service account key file
SERVICE_ACCOUNT_FILE = 'path_to_your_service_account_key.json'

# Scopes required for the Admin SDK and Google Sheets API
SCOPES = [
    'https://www.googleapis.com/auth/admin.directory.user.readonly',
    'https://www.googleapis.com/auth/spreadsheets'
]

# Admin email
ADMIN_EMAIL = 'admin@example.com'

# Spreadsheet ID and range
SPREADSHEET_ID = 'your_spreadsheet_id'
RANGE_NAME = 'Sheet1!A1:B1'  # Adjust to your sheet and range

# Authenticate and build the services
credentials = service_account.Credentials.from_service_account_file(
    SERVICE_ACCOUNT_FILE, scopes=SCOPES)
delegated_credentials = credentials.with_subject(ADMIN_EMAIL)
admin_service = build('admin', 'directory_v1', credentials=delegated_credentials)
sheets_service = build('sheets', 'v4', credentials=credentials)

# Function to get all users in the domain
def get_all_users():
    results = admin_service.users().list(customer='my_customer', maxResults=500, orderBy='email').execute()
    users = results.get('users', [])
    return [user['name']['fullName'] for user in users]

# Get the list of names from Google Workspace
names = get_all_users()