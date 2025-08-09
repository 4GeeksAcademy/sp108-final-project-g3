"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from flask_cors import CORS
from flask_jwt_extended import get_jwt_identity, jwt_required, create_access_token, get_jwt
from werkzeug.security import check_password_hash, generate_password_hash
from api.utils import generate_sitemap, APIException
from api.models import db, Users, Products, Favorites, Messages, Comments, Orders, OrderItems
from datetime import datetime

api = Blueprint('api', __name__)
CORS(api)   # Allow CORS requests to this API

VALID_CATEGORIES = [
    'Coches',
    'Motos',
    'Motor y Accesorios',
    'Moda y Accesorios',
    'Tecnología y Electrónica',
    'Móviles y Tecnología',
    'Informática',
    'Deporte y Ocio',
    'Bicicletas'
]

@api.route('/hello', methods=['GET'])
def handle_hello():
    return {"message": "Hello! I'm a message that came from the backend"}, 200


# USERS ----------------------------------------------------------------------
@api.route('/users', methods=['GET'])
def get_users():
    users = Users.query.filter_by(is_active=True).all()
    if not users:
        return {"message": "No hay usuarios activos."}, 400
    return {"results": [user.serialize() for user in users]}, 200


@api.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = Users.query.filter_by(id=user_id, is_active=True).first()
    if user is None:
        return {"message": "Usuario no encontrado."}, 404
    return {"results": user.serialize()}, 200


@api.route('/users/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    user = Users.query.get(user_id)
    if user is None:
        return {"message": "Usuario no encontrado"}, 404

    claims = get_jwt()
    if claims['user_id'] != user.id and claims.get('role') != 'admin':
        return {"message": "No autorizado para modificar este usuario."}, 403

    data = request.json
    user.first_name = data.get("first_name", user.first_name)
    user.last_name = data.get("last_name", user.last_name)
    user.email = data.get("email", user.email)

    db.session.commit()
    return {"results": user.serialize()}, 200


@api.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    user = Users.query.get(user_id)
    if user is None:
        return {"message": "Usuario no encontrado."}, 404

    claims = get_jwt()
    if claims['user_id'] != user.id and claims.get('role') != 'admin':
        return {"message": "No autorizado para desactivar este usuario."}, 403

    user.is_active = False
    db.session.commit()

    return {"results": "Usuario desactivado correctamente."}, 200


# PRODUCTS -------------------------------------------------------------------
@api.route('/products', methods=['GET'])
def get_products():
    products = Products.query.filter_by(available=True).all()
    return {"results": [product.serialize() for product in products]}, 200


@api.route('/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    product = Products.query.get(product_id)
    if product is None:
        return {"message": "Producto no encontrado."}, 404
    return product.serialize(), 200


@api.route('/products', methods=['POST'])
@jwt_required()
def create_product():
    claims = get_jwt()
    data = request.json

    if claims.get('role') != 'vendedor':
        return {"message": "Solo los vendedores pueden crear productos."}, 403

    required_fields = ['title', 'description', 'price', 'location', 'tags', 'category']
    missing_fields = [field for field in required_fields if not data.get(field)]
    if missing_fields:
        return {"message": f"Faltan campos obligatorios: {', '.join(missing_fields)}"}, 400

    category = data.get("category")
    if category not in VALID_CATEGORIES:
        return {"message": f"Categoría inválida. Debe ser una de: {', '.join(VALID_CATEGORIES)}"}, 400

    images = data.get("images", [])

    new_product = Products(
        user_id=claims['user_id'],
        title=data.get("title"),
        description=data.get("description"),
        price=data.get("price"),
        available=data.get("available", True),
        location=data.get("location"),
        image_urls=images,
        tags=data.get("tags"),
        category=category,
        was_sold=False
    )

    db.session.add(new_product)
    db.session.commit()
    return {"results": new_product.serialize()}, 201


@api.route('/products/<int:product_id>', methods=['PUT'])
@jwt_required()
def update_product(product_id):
    claims = get_jwt()
    product = Products.query.get(product_id)

    if product is None:
        return {"message": "Producto no encontrado."}, 404

    if claims['user_id'] != product.user_id and claims.get('role') != 'admin':
        return {"message": "No autorizado para modificar este producto."}, 403

    data = request.json
    product.title = data.get("title", product.title)
    product.description = data.get("description", product.description)
    product.price = data.get("price", product.price)
    product.available = data.get("available", product.available)
    product.location = data.get("location", product.location)

    images = data.get("images")
    if images is not None:
        product.image_urls = images

    product.tags = data.get("tags", product.tags)
    product.was_sold = data.get("was_sold", product.was_sold)

    new_category = data.get("category")
    if new_category:
        if new_category not in VALID_CATEGORIES:
            return {"message": f"Categoría inválida. Debe ser una de: {', '.join(VALID_CATEGORIES)}"}, 400
        product.category = new_category

    db.session.commit()
    return {"results": product.serialize()}, 200


@api.route('/products/<int:product_id>', methods=['DELETE'])
@jwt_required()
def delete_product(product_id):
    claims = get_jwt()
    product = Products.query.get(product_id)

    if product is None:
        return {"message": "Producto no encontrado."}, 404

    if claims['user_id'] != product.user_id and claims.get('role') != 'admin':
        return {"message": "No autorizado para eliminar este producto."}, 403

    if product.was_sold:
        return {"message": "Este producto ya fue vendido y no puede eliminarse."}, 403

    db.session.delete(product)
    db.session.commit()
    return {"message": "Producto eliminado correctamente."}, 200


@api.route('/products/user', methods=['GET'])
@jwt_required()
def get_products_by_user():
    claims = get_jwt()
    user_id = claims.get('user_id')

    products = Products.query.filter_by(user_id=user_id).all()
    if not products:
        return {"message": "Este usuario no ha publicado productos."}, 404

    return {
        "results": [product.serialize() for product in products],
        "message": "Productos publicados por el usuario."
    }, 200


# FAVORITES ------------------------------------------------------------------
@api.route('/favorites', methods=['GET'])
@jwt_required()
def get_favorites():
    current_user_id = get_jwt_identity()
    rows = Favorites.query.filter_by(user_id=current_user_id).all()
    if not rows:
        return {"message": "No hay favoritos."}, 404

    return {
        "message": "Lista de favoritos.",
        "results": [fav.serialize() for fav in rows]
    }, 200


@api.route('/favorites', methods=['POST'])
@jwt_required()
def create_favorite():
    data = request.get_json()
    claims = get_jwt()
    current_user_id = claims["user_id"]
    if claims["role"] != "comprador":
        return {"message": "No autorizado para crear favoritos"}, 400

    if 'product_id' not in data:
        return {"message": "Falta product_id."}, 400

    row = db.session.execute(db.select(Products).where(Products.id == data["product_id"])).scalar()
    if not row:
        return {"message": "El producto no existe"}, 400

    fav = Favorites(user_id=current_user_id, product_id=data['product_id'])
    db.session.add(fav)
    db.session.commit()
    return {"message": "Favorito creado", "results": fav.serialize()}, 201


@api.route('/favorites/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_favorite(id):
    fav = Favorites.query.get(id)
    if not fav:
        return {"error": "Favorito no encontrado."}, 404

    claims = get_jwt()
    if fav.user_id != claims["user_id"]:
        return {"error": "No autorizado para eliminar este favorito."}, 403

    db.session.delete(fav)
    db.session.commit()
    return {"message": "Favorito eliminado correctamente."}, 200


# MESSAGES -------------------------------------------------------------------
@api.route('/messages', methods=['GET'])
@jwt_required()
def get_messages():
    rows = Messages.query.all()
    if not rows:
        return {"message": "No hay mensajes."}, 400
    return {
        "results": [row.serialize() for row in rows],
        "message": "Lista de mensajes."
    }, 200


@api.route('/messages', methods=['POST'])
@jwt_required()
def create_message():
    data = request.get_json()
    required_fields = ['user_sender', 'user_receiver', 'content', 'created_at', 'review_date']
    missing = [field for field in required_fields if not data.get(field)]
    if missing:
        return {"message": f"Faltan campos: {', '.join(missing)}"}, 400

    message = Messages(
        user_sender=data['user_sender'],
        user_receiver=data['user_receiver'],
        content=data['content'],
        created_at=datetime.strptime(data['created_at'], '%Y-%m-%d %H:%M:%S'),
        review_date=datetime.strptime(data['review_date'], '%Y-%m-%d %H:%M:%S')
    )
    db.session.add(message)
    db.session.commit()
    return {"results": message.serialize(), "message": "Mensaje creado correctamente"}, 201


# COMMENTS -------------------------------------------------------------------
@api.route('/comments', methods=['GET'])
def get_comments():
    rows = Comments.query.all()
    if not rows:
        return {"message": "No hay comentarios."}, 400
    return {
        "results": [row.serialize() for row in rows],
        "message": "Lista de comentarios."
    }, 200


@api.route('/comments', methods=['POST'])
@jwt_required()
def create_comment():
    data = request.get_json()
    required_fields = ['user_id', 'product_id', 'content', 'created_at']
    missing = [field for field in required_fields if not data.get(field)]
    if missing:
        return {"message": f"Faltan campos: {', '.join(missing)}"}, 400

    comment = Comments(
        user_id=data['user_id'],
        product_id=data['product_id'],
        content=data['content'],
        created_at=datetime.strptime(data['created_at'], '%Y-%m-%d %H:%M:%S')
    )
    db.session.add(comment)
    db.session.commit()
    return {"results": comment.serialize(), "message": "Comentario creado correctamente"}, 201


# AUTH ----------------------------------------------------------------------
@api.route('/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email', '').lower()
    password = data.get('password', '')
    first_name = data.get('first_name', '')
    last_name = data.get('last_name', '')
    role = data.get('role', 'comprador')

    if not email or not password:
        return {"msg": "Email and password are required"}, 400

    if Users.query.filter_by(email=email).first():
        return {"msg": "El email introducido ya está registrado."}, 400

    user = Users(
        email=email,
        password=generate_password_hash(password),
        is_active=True,
        role=role,
        first_name=first_name,
        last_name=last_name
    )

    db.session.add(user)
    db.session.commit()

    claims = {
        'user_id': user.id,
        'role': user.role,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'email': user.email
    }

    access_token = create_access_token(identity=email, additional_claims=claims)

    return {
        "access_token": access_token,
        "results": user.serialize(),
        "message": "Usuario registrado correctamente"
    }, 201


@api.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email", "").lower()
    password = data.get("password", "")

    if not email or not password:
        return {"msg": "Email and password are required"}, 400

    user = Users.query.filter_by(email=email, is_active=True).first()

    if not user or not check_password_hash(user.password, password):
        return {"msg": "Email o contraseña incorrectos."}, 401

    claims = {
        "user_id": user.id,
        "role": user.role,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email
    }

    access_token = create_access_token(identity=email, additional_claims=claims)

    return {
        "message": "User logged in successfully",
        "access_token": access_token
    }, 200


@api.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    claims = get_jwt()
    return {
        "message": "Token is valid",
        "user_id": claims.get('user_id'),
        "role": claims.get('role'),
        "first_name": claims.get('first_name'),
        "last_name": claims.get('last_name'),
        "email": claims.get('email')
    }, 200
