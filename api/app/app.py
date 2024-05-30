import logging
import os
import sys

from flask import Flask
from flask_cors import CORS

from blueprints.upload import upload_bp
from blueprints.editor.editor import editor_bp
from blueprints.catalog.catalog import catalog_bp

import models.db.connection as db_connection
import log_config
from config import config

# This must run before the app is created to override the default
# flask logging configuration
log_config.configure()

app = Flask(__name__)
CORS(app,
     resources={r"/*": {"origins": "*"}},
     send_wildcard=True)

config(app)
logging.getLogger('flask_cors').level = logging.DEBUG
logging.getLogger('flask_cors').addHandler(logging.StreamHandler(sys.stdout))
app.logger.level = logging.DEBUG

app.register_blueprint(upload_bp, url_prefix='/api/v1/upload')
app.register_blueprint(editor_bp, url_prefix='/api/v1/editor')
app.register_blueprint(catalog_bp, url_prefix='/api/v1/catalog')


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
