from flask import Blueprint, jsonify
from models.db.connection import get_session
from models.db.models import Upload

catalog_bp = Blueprint('catalog', __name__)


@catalog_bp.route('/featured', methods=['GET'])
def featured():
    return jsonify({'message': 'ok',
                    'data': [{'name': 'foo', 'ref': 'http://localhost:5555/catalog/ref'}]})


@catalog_bp.route('/all', methods=['GET'])
def catalog():
    session = get_session()
    uploads = session.query(Upload).filter(Upload.status == 'upload_completed').all()
    results = list()
    for u in uploads:
        results.append(u.to_dict())
    return jsonify({'message': 'ok',
                    'data': results})
