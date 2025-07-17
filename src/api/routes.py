"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from api.models import db, Users , Favorites, Messages

api = Blueprint('api', __name__)
CORS(api)  # Allow CORS requests to this API


@api.route('/hello', methods=['GET'])
def handle_hello():
    response_body = {}
    response_body['message'] = "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    return response_body, 200




@api.route('/messages', methods=['GET'])
def get_messages():
    messages = Messages.query.all()
    return jsonify([msg.serialize() for msg in messages]), 200

@api.route('/messages', methods=['POST'])
def create_message():
    data = request.get_json()
    msg = Messages(user_id=data.get('user_id'),
                   user_to=data.get('user_to'),
                   content=data.get('content'),
                   created_at=data.get('created_at'),
                   review_date=data.get('review_date'))
    db.session.add(msg)
    db.session.commit()
    return jsonify(msg.serialize()), 201

@api.route('/messages/<int:id>', methods=['DELETE'])
def delete_message(id):
    msg = Messages.query.get(id)
    if not msg:
        return jsonify({"error": "Message not found"}), 404
    db.session.delete(msg)
    db.session.commit()
    return jsonify({"msg": "Message deleted"}), 200

@api.route('/favorites', methods=['GET'])
def get_favorites():
    favorites = Favorites.query.all()
    return jsonify([fav.serialize() for fav in favorites]), 200

@api.route('/favorites', methods=['POST'])
def create_favorite():
    data = request.get_json()
    fav = Favorites(user_id=data.get('user_id'),
                    product_id=data.get('product_id'))
    db.session.add(fav)
    db.session.commit()
    return jsonify(fav.serialize()), 201

@api.route('/favorites/<int:id>', methods=['DELETE'])
def delete_favorite(id):
    fav = Favorites.query.get(id)
    if not fav:
        return jsonify({"error": "Favorite not found"}), 404
    db.session.delete(fav)
    db.session.commit()
    return jsonify({"msg": "Favorite deleted"}), 200






