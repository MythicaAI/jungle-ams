from flask import Blueprint, jsonify
from fastapi import APIRouter
from db.connection import get_session
from db.schema.media import FileContent

router = APIRouter(prefix="/catalog")


@router.get('/featured')
async def featured():
    return jsonify({'message': 'ok',
                    'data': [{'name': 'foo', 'ref': 'http://localhost:5555/catalog/ref'}]})


@router.get('/all')
async def catalog():
    session = get_session()
    uploads = session.query(FileContent).all()
    results = list()
    for u in uploads:
        results.append(u.to_dict())
    return jsonify({'message': 'ok',
                    'data': results})
