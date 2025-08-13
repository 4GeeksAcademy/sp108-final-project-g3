from flask import Flask, request, jsonify, url_for, Blueprint
from flask_cors import CORS
from flask_jwt_extended import get_jwt_identity, jwt_required, create_access_token, get_jwt
from werkzeug.security import check_password_hash, generate_password_hash
from api.utils import generate_sitemap, APIException
from api.models import db, Users, Products, Favorites, Messages, Comments, Orders, OrderItems
from datetime import datetime
from flask import Blueprint, request, jsonify
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from werkzeug.security import generate_password_hash
import os
from flask import current_app as app
from flask_mail import Mail, Message
from sqlalchemy import or_, func

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

def generate_reset_token(email):
    serializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])
    return serializer.dumps(email, salt='password-reset')

def verify_reset_token(token, max_age=3600):
    serializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])
    try:
        email = serializer.loads(token, salt='password-reset', max_age=max_age)
        return email
    except (BadSignature, SignatureExpired):
        return None

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
    search_query = request.args.get('q', '').strip()
    category = request.args.get('category', '').strip()
    tags = request.args.get('tags', '').strip()

    query = Products.query.filter_by(available=True)

    if search_query:
        search_term = f"%{search_query}%"
        query = query.filter(
            or_(
                Products.title.ilike(search_term),
                Products.description.ilike(search_term),
                func.cast(Products.category, db.Text).ilike(search_term)
            )
        )

    if category:
        if category not in VALID_CATEGORIES:
            return {"message": f"Categoría inválida. Debe ser una de: {', '.join(VALID_CATEGORIES)}"}, 400
        query = query.filter(Products.category == category)

    if tags:
        valid_tags = ['new', 'used', 'acceptable']
        if tags not in valid_tags:
            return {"message": f"Estado inválido. Debe ser uno de: {', '.join(valid_tags)}"}, 400
        query = query.filter(Products.tags == tags)

    products = query.all()

    if not products:
        return {"message": "No se encontraron productos que coincidan con los criterios."}, 404

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
    claims = get_jwt()
    current_user_id = claims["user_id"]
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
        return {"message": "No hay mensajes."}, 200
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

# ORDERS ---------------------------------------------------------------------
@api.route('/orders', methods=['GET'])
@jwt_required()
def get_orders():
    claims = get_jwt()
    user_role = claims.get('role')
    user_id = claims.get('user_id')

    if user_role == 'admin':
        orders = Orders.query.all()
    else:
        orders = Orders.query.filter_by(user_id=user_id).all()

    if not orders:
        return {"message": "No hay pedidos."}, 404

    return {"results": [order.serialize() for order in orders]}, 200

@api.route('/orders', methods=['POST'])
@jwt_required()
def create_order():
    claims = get_jwt()
    user_id = claims.get('user_id')
    data = request.get_json()

    if not data or 'order_items' not in data:
        return {"message": "Faltan datos para crear el pedido."}, 400

    order = Orders(user_id=user_id, status='pending',
                   created_at=datetime.utcnow())
    db.session.add(order)
    db.session.flush()

    for item in data['order_items']:
        product_id = item.get('product_id')
        quantity = item.get('quantity', 1)

        if not product_id:
            continue

        product = Products.query.get(product_id)
        if not product:
            continue

        order_item = OrderItems(
            order_id=order.id,
            product_id=product_id,
            quantity=quantity
        )
        db.session.add(order_item)

    db.session.commit()

    return {"results": order.serialize(), "message": "Pedido creado correctamente"}, 201

@api.route('/orders/<int:order_id>', methods=['PUT'])
@jwt_required()
def update_order(order_id):
    claims = get_jwt()
    order = Orders.query.get(order_id)

    if order is None:
        return {"message": "Pedido no encontrado."}, 404

    if claims.get('role') != 'admin' and claims.get('user_id') != order.user_id:
        return {"message": "No autorizado para modificar este pedido."}, 403

    data = request.json
    order.status = data.get('status', order.status)
    db.session.commit()

    return {"results": order.serialize(), "message": "Pedido actualizado correctamente"}, 200

@api.route('/orders/<int:order_id>', methods=['DELETE'])
@jwt_required()
def delete_order(order_id):
    claims = get_jwt()
    order = Orders.query.get(order_id)

    if order is None:
        return {"message": "Pedido no encontrado."}, 404

    if claims.get('role') != 'admin' and claims.get('user_id') != order.user_id:
        return {"message": "No autorizado para eliminar este pedido."}, 403

    db.session.delete(order)
    db.session.commit()

    return {"message": "Pedido eliminado correctamente."}, 200

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

@api.route('/password/forgot', methods=['POST'])
def forgot_password():
    from app import mail
    data = request.get_json()
    email = data.get('email')
    user = Users.query.filter_by(email=email).first()
    if user:
        token = generate_reset_token(email)
        reset_url = f"{os.getenv("VITE_FRONTEND_URL")}/reset-password/{token}"
        msg=Message(subject="Recuperación de contraseña",
                      recipients=[email],
                      body=f"Hola {user.first_name},\n\nHaz clic en el siguiente enlace para cambiar tu contraseña:\n{reset_url}\n\nEste enlace expirará en 1 hora.")
        mail.send(msg)
    return jsonify({"msg": "Si el correo está registrado, se ha enviado un enlace de recuperación."}), 200

@api.route('/password/reset/<token>', methods=['POST'])
def reset_password(token):
    data = request.get_json()
    new_password = data.get('password')
    email = verify_reset_token(token)
    if not email:
        return jsonify({"msg": "Token inválido o expirado"}), 400

    user = Users.query.filter_by(email=email).first()
    if not user:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    user.password = generate_password_hash(new_password)
    db.session.commit()

    return jsonify({"msg": "Contraseña actualizada correctamente."}), 200

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