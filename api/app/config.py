import tempfile

# Instantiate a temporary directory for the duration of the program lifecycle
temp_dir = tempfile.TemporaryDirectory()

def config(app):
    app.config['UPLOAD_FOLDER'] = temp_dir.name
    app.config["UPLOAD_FOLDER_AUTOCLEAN"] = True

    app.config['ENABLE_STORAGE'] = True
    app.config['BUCKET_NAME'] = 'ingest'

    app.config['ENABLE_DB'] = True

    # This allows overriding the settings above using e.g. APP_UPLOAD_FOLDER
    app.config.from_prefixed_env('APP')
