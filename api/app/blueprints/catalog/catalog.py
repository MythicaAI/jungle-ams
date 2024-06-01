from flask import Blueprint, jsonify
from db.connection import get_session
from db.schema.media import FileContent

catalog_bp = Blueprint('catalog', __name__)


@catalog_bp.route('/featured', methods=['GET'])
def featured():
    return jsonify({'message': 'ok',
                    'data': [{'name': 'foo', 'ref': 'http://localhost:5555/catalog/ref'}]})


@catalog_bp.route('/all', methods=['GET'])
def catalog():
    session = get_session()
    uploads = session.query(FileContent).all()
    results = list()
    for u in uploads:
        results.append(u.to_dict())
    return jsonify({'message': 'ok',
                    'data': results})
