import os
import sys

sys.path.append(os.getcwd())
sys.path.append(os.path.join(os.getcwd(), "app"))
#
import firebase_admin
from cache import cache
from dotenv import load_dotenv
from firebase_admin import credentials
from flask import Flask
from flask_cors import CORS

load_dotenv()

cred = credentials.Certificate("app/credentials.json")
firebase_app = firebase_admin.initialize_app(cred)

app = Flask(__name__)
CORS(app)
cache.init_app(app)
print(sys.path)
