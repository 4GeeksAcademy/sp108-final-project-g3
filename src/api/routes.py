"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from api.models import db, Users , Favorites, Messages

from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import jwt_required
from api.models import db, Users, Favorites, Messages, Orders, OrderItems
from datetime import datetime


api = Blueprint('api', __name__)
CORS(api)  # Allow CORS requests to this API


@api.route('/hello', methods=['GET'])
def handle_hello():
    response_body = {}
    response_body['message'] = "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    return response_body, 200

@api.route("/orders", methods=["GET"])
@jwt_required()
def orders():
    response_body = {}
    current_user = get_jwt_identity()
    orders = orders.query.filter_by(user_id=current_user).all()
    response_body["orders"] = [order.serialize() for order in orders]
    return response_body, 200

@api.route("/order-items", methods=["GET"])
@jwt_required()
def get_order_items():
    response_body = {}
    current_user = get_jwt_identity()

    items = db.session.query(OrderItems).join(Orders).filter(
        Orders.user_id == current_user).all()

    response_body["order_items"] = [item.serialize() for item in items]
    return response_body, 200

@api.route("/order-items/<int:item_id>", methods=["GET"])
@jwt_required()
def get_order_item(item_id):
    response_body = {}
    current_user = get_jwt_identity()

    item = db.session.query(OrderItems).join(Orders).filter(
        OrderItems.id == item_id,
        Orders.user_id == current_user).first()

    if not item:
        return {"error": "Item no encontrado o no autorizado"}, 404

    response_body["order_item"] = item.serialize()
    return response_body, 200

@api.route("/order-items", methods=["POST"])
@jwt_required()
def create_order_item():
    response_body = {}
    current_user = get_jwt_identity()
    data = request.get_json()

    order = Orders.query.filter_by(id=data['order_id'], user_id=current_user).first()
    if not order:
        return {"error": "Order not found or unauthorized"}, 403

    try:
        new_item = OrderItems(
            order_id=data['order_id'],
            product_id=data['product_id'],
            total=data['total']
        )
        db.session.add(new_item)
        db.session.commit()
        response_body["order_item"] = new_item.serialize()
        return response_body, 201
    except Exception as e:
        db.session.rollback()
        return {"error": str(e)}, 400

@api.route("/order-items/<int:item_id>", methods=["PUT"])
@jwt_required()
def update_order_item(item_id):
    response_body = {}
    current_user = get_jwt_identity()
    data = request.get_json()

    item = db.session.query(OrderItems).join(Orders).filter(
        OrderItems.id == item_id,
        Orders.user_id == current_user
    ).first()

    if not item:
        return {"error": "Item not found or unauthorized"}, 404

    try:
        item.product_id = data.get("product_id", item.product_id)
        item.total = data.get("total", item.total)
        db.session.commit()
        response_body["order_item"] = item.serialize()
        return response_body, 200
    except Exception as e:
        db.session.rollback()
        return {"error": str(e)}, 400

@api.route("/order-items/<int:item_id>", methods=["DELETE"])
@jwt_required()
def delete_order_item(item_id):
    response_body = {}
    current_user = get_jwt_identity()

    item = db.session.query(OrderItems).join(Orders).filter(
        OrderItems.id == item_id,
        Orders.user_id == current_user
    ).first()

    if not item:
        return {"error": "Item not found or unauthorized"}, 404

    db.session.delete(item)
    db.session.commit()
    response_body["message"] = f"Order item {item_id} deleted"
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







