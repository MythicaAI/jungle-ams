from flask import Blueprint, render_template

# Create a Blueprint
editor_bp = Blueprint('editor', __name__, template_folder='templates', static_folder='static')

@editor_bp.route('/')
def editor():
    return render_template('editor.html')
