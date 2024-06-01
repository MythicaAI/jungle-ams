from flask import Blueprint, request, jsonify, g, current_app as app

assets_bp = Blueprint('assets', __name__)
@assets_bp.route('latest', methods=['GET'])
def get_assets_by_latest_ts():
    pass

@assets_bp.route('named/<asset_name>', methods=['GET'])
def get_asset_by_name(asset_name):
    pass

@assets_bp.route('<asset_id>', methods=['GET'])
def get_asset_by_id(asset_name):
    pass

@assets_bp.route('create', methods=['POST'])
def create_asset():
    pass

@assets_bp.route('update', methods=['POST'])
def update_asset():
    pass






