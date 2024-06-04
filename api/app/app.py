import logging
import os
import sys

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware

from routes.upload import router
from routes.editor.editor import editor_bp
from routes.catalog.catalog import router
from routes.profiles.profiles import router
from routes.assets.assets import router

import db.connection as db_connection
import log_config
from config import config

# This must run before the app is created to override the default
# flask logging configuration
log_config.configure()

app = FastAPI()

origins = [
    "https://api.mythica.ai",
    "http://localhost",
    "http://localhost:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

config(app)
logging.getLogger('flask_cors').level = logging.DEBUG
logging.getLogger('flask_cors').addHandler(logging.StreamHandler(sys.stdout))
app.logger.level = logging.DEBUG

app.register_blueprint(router, url_prefix='/api/v1/upload')
app.register_blueprint(editor_bp, url_prefix='/api/v1/editor')
app.register_blueprint(router, url_prefix='/api/v1/catalog')
app.register_blueprint(router, url_prefix='/api/v1/profiles')
app.register_blueprint(router, url_prefix='/api/v1/assets')


@app.route("/", methods=["GET"])
def root():
    app.logger.info('Root endpoint hit')
    return "Alive and well"


if __name__ == '__main__':
    # setup logging and validate dependencies before serving clients
    db_connection.validate()

    print('database validated')
    print(f"temporary upload folder is {app.config['UPLOAD_FOLDER']}")

    listen_addr = os.environ.get('HTTP_LISTEN_ADDR', '0.0.0.0')
    port = int(os.environ.get('HTTP_LISTEN_PORT', 5555))
    app.run(debug=True, host=listen_addr, port=port)
