"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from api.models import db, Users , Favorites, Messages
from datetime import datetime

api = Blueprint('api', __name__)
CORS(api)  # Allow CORS requests to this API


@api.route('/hello', methods=['GET'])
def handle_hello():
    response_body = {}
    response_body['message'] = "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    return response_body, 200




@api.route('/messages', methods=['GET'])
def get_messages():
    response_body ={}
    rows = Messages.query.all()
    if not rows:
        response_body["message"]= "No hay mensajes"
        return response_body, 400
    response_body["results"] = [row.serialize() for row in rows]
    response_body["message"]= "list of messages"

@api.route('/messages', methods=['POST'])
def create_message():
    data = request.get_json()

    required_fields = ['user_sender', 'user_receiver', 'content', 'created_at', 'review_date']
    if not all(field in data for field in required_fields):
        return {"error": "Missing required fields"}, 400

    try:
        created_at = datetime.strptime(data.get('created_at'), "%d-%m-%Y").date()
        review_date = datetime.strptime(data.get('review_date'), "%d-%m-%Y").date()
    except ValueError:
        return {"error": "INCORRECT DATE FORMAT. Use DD-MM-YYYY."}, 400

    msg = Messages(
        user_sender=data.get('user_sender'),
        user_receiver=data.get('user_receiver'),
        content=data.get('content'),
        created_at=created_at,
        review_date=review_date
    )

    db.session.add(msg)
    db.session.commit()

    return msg.serialize(), 201


@api.route('/messages/<int:id>', methods=['DELETE'])
def delete_message(id):
    msg = Messages.query.get(id)
    if not msg:
        return {"error": "Message not found"}, 404

    db.session.delete(msg)
    db.session.commit()

    return {"msg": "Message deleted"}, 200


@api.route('/favorites', methods=['GET'])
def get_favorites():
    rows = Favorites.query.all()
    if not rows:
        return {"message": "No hay favoritos"}, 404

    return {
        "message": "list of favorites",
        "results": [fav.serialize() for fav in rows]
    }, 200


@api.route('/favorites', methods=['POST'])
def create_favorite():
    data = request.get_json()

    if 'user_id' not in data or 'product_id' not in data:
        return {"error": "Missing user_id or product_id"}, 400

    fav = Favorites(
        user_id=data['user_id'],
        product_id=data['product_id']
    )

    db.session.add(fav)
    db.session.commit()

    return fav.serialize(), 201


@api.route('/favorites/<int:id>', methods=['DELETE'])
def delete_favorite(id):
    fav = Favorites.query.get(id)
    if not fav:
        return {"error": "Favorite not found"}, 404

    db.session.delete(fav)
    db.session.commit()

    return {"msg": "Favorite deleted"}, 200







