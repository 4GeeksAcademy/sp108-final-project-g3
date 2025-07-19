"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from api.models import db, Users, Products 

api = Blueprint('api', __name__)
CORS(api)  # Allow CORS requests to this API


@api.route('/hello', methods=['GET'])
def handle_hello():
    response_body = {}
    response_body['message'] = "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    return response_body, 200


@api.route('/users', methods=['GET'])
def get_users():
    users = Users.query.filter_by(is_active=True).all()
    if not users:
        return {"message": "No hay usuarios activos."}, 400
    response_body = {"results": [user.serialize() for user in users]}
    return response_body, 200


@api.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = Users.query.filter_by(id=user_id, is_active=True).first()
    if user is None:
        return {"message": "Usuario no encontrado"}, 404
    return user.serialize(), 200


@api.route('/users', methods=['POST'])
def create_user():
    data = request.json
    if not data.get("email") or not data.get("password"):
        return {"message": "Faltan datos obligatorios"}, 400

    new_user = Users(
        first_name=data.get("first_name"),
        last_name=data.get("last_name"),
        email=data.get("email"),
        password=data.get("password"),
        role=data.get("role"),
        is_active=data.get("is_active", True)
    )
    db.session.add(new_user)
    db.session.commit()
    return new_user.serialize(), 201


@api.route('/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    user = Users.query.get(user_id)
    if user is None:
        return {"message": "Usuario no encontrado"}, 404

    data = request.json
    user.first_name = data.get("first_name", user.first_name)
    user.last_name = data.get("last_name", user.last_name)
    user.email = data.get("email", user.email)
    user.role = data.get("role", user.role)
    user.is_active = data.get("is_active", user.is_active)

    db.session.commit()
    return user.serialize(), 200


@api.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    user = Users.query.get(user_id)
    if user is None:
        return {"message": "Usuario no encontrado"}, 404

    user.is_active = False
    db.session.commit()
    return {"message": "Usuario desactivado correctamente"}, 200


@api.route('/products', methods=['GET'])
def get_products():
    products = Products.query.all()
    response_body = {"results": [product.serialize() for product in products]}
    if not products:
        response_body["results"] = []
        return response_body, 200
    return response_body, 200


@api.route('/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    product = Products.query.get(product_id)
    if product is None:
        return {"message": "Producto no encontrado"}, 404
    return product.serialize(), 200


@api.route('/products', methods=['POST'])
def create_product():
    data = request.json
    new_product = Products(
        user_id=data.get("user_id"),
        title=data.get("title"),
        description=data.get("description"),
        price=data.get("price"),
        available=data.get("available", True),
        localitation=data.get("localitation"),
        image_url=data.get("image_url"),
        tags=data.get("tags")
    )
    db.session.add(new_product)
    db.session.commit()
    return new_product.serialize(), 201


@api.route('/products/<int:product_id>', methods=['PUT'])
def update_product(product_id):
    product = Products.query.get(product_id)
    if product is None:
        return {"message": "Producto no encontrado"}, 404

    data = request.json
    product.title = data.get("title", product.title)
    product.description = data.get("description", product.description)
    product.price = data.get("price", product.price)
    product.available = data.get("available", product.available)
    product.localitation = data.get("localitation", product.localitation)
    product.image_url = data.get("image_url", product.image_url)
    product.tags = data.get("tags", product.tags)

    db.session.commit()
    return product.serialize(), 200


@api.route('/products/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    product = Products.query.get(product_id)
    if product is None:
        return {"message": "Producto no encontrado"}, 404

    db.session.delete(product)
    db.session.commit()
    return {"message": "Producto eliminado correctamente"}, 200


@api.route('/comments', methods=['GET'])
def get_comments():
    comments = Comments.query.all()
    if not comments:
        return {"results": [], "message": "No hay comentarios."}, 200
    response_body = {"results": [comment.serialize() for comment in comments]}
    return response_body, 200


@api.route('/comments/<int:comment_id>', methods=['GET'])
def get_comment(comment_id):
    comment = Comments.query.get(comment_id)
    if comment is None:
        return {"message": "Comentario no encontrado."}, 404
    return comment.serialize(), 200


@api.route('/comments', methods=['POST'])
def create_comment():
    data = request.json
    new_comment = Comments(
        user_id=data.get("user_id"),
        product_id=data.get("product_id"),
        content=data.get("content")
    )
    db.session.add(new_comment)
    db.session.commit()
    return new_comment.serialize(), 201


@api.route('/comments/<int:comment_id>', methods=['PUT'])
def update_comment(comment_id):
    comment = Comments.query.get(comment_id)
    if comment is None:
        return {"message": "Comentario no encontrado."}, 404

    data = request.json
    comment.content = data.get("content", comment.content)

    db.session.commit()
    return comment.serialize(), 200


@api.route('/comments/<int:comment_id>', methods=['DELETE'])
def delete_comment(comment_id):
    comment = Comments.query.get(comment_id)
    if comment is None:
        return {"message": "Comentario no encontrado."}, 404

    db.session.delete(comment)
    db.session.commit()
    return {"message": "Comentario eliminado correctamente."}, 200