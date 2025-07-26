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


@api.route('/hello', methods=['GET'])
def handle_hello():
    response_body = {}
    response_body['message'] = "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    return response_body, 200


# USERS ----------------------------------------------------------------------
@api.route('/users', methods=['GET'])
def get_users():
    response_body = {}
    users = Users.query.filter_by(is_active=True).all()
    if not users:
        return {"message": "No hay usuarios activos."}, 400
    response_body = {"results": [user.serialize() for user in users]}
    return response_body, 200


@api.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    response_body = {}
    user = Users.query.filter_by(id=user_id, is_active=True).first()
    if user is None:
        return {"message": "Usuario no encontrado."}, 404
    response_body['results'] = user.serialize()
    return response_body, 200


@api.route('/users/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    response_body = {}
    user = Users.query.get(user_id)

    if user is None:
        response_body['message'] = "Usuario no encontrado"
        return response_body, 404

    claims = get_jwt()

    # Solo puede cambiar su propia cuenta. Si no es su cuenta, solo un admin puede hacerlo.
    if claims['user_id'] != user.id and claims.get('role') != 'admin':
        response_body['message'] = "No autorizado para modificar este usuario."
        return response_body, 403

    data = request.json
    user.first_name = data.get("first_name", user.first_name)
    user.last_name = data.get("last_name", user.last_name)
    user.email = data.get("email", user.email)

    db.session.commit()
    response_body['results'] = user.serialize()
    return response_body, 200


@api.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    response_body = {}
    user = Users.query.get(user_id)
    if user is None:
        response_body['message'] = "Usuario no encontrado."
        return response_body, 404

    claims = get_jwt()
    # Si no es su propia cuenta y tampoco es admin, no tiene permiso para borrar
    if claims['user_id'] != user.id and claims.get('role') != 'admin':
        response_body['message'] = "No autorizado para desactivar este usuario."
        return response_body, 403

    user.is_active = False
    db.session.commit()

    response_body['results'] = "Usuario desactivado correctamente."
    return response_body, 200


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
    response_body = {}
    claims = get_jwt()
    data = request.json
    
    # Verificar que el usuario sea vendedor
    if claims.get('role') != 'vendedor':
        response_body['message'] = "Solo los vendedores pueden crear productos."
        return response_body, 403
    
    # Campos obligatorios
    required_fields = ['title', 'description', 'price', 'location']
    missing_fields = [field for field in required_fields if not data.get(field)]
    if missing_fields:
        response_body['message'] = f"Faltan campos obligatorios: {', '.join(missing_fields)}"
        return response_body, 400

    new_product = Products(
        user_id=claims['user_id'],
        title=data.get("title"),
        description=data.get("description"),
        price=data.get("price"),
        available=data.get("available", True),
        location=data.get("location"),
        image_url=data.get("image_url"),
        tags=data.get("tags")
    )
    db.session.add(new_product)
    db.session.commit()
    response_body['results'] = new_product.serialize()
    return response_body, 201


@api.route('/products/<int:product_id>', methods=['PUT'])
@jwt_required()
def update_product(product_id):
    response_body = {}
    claims = get_jwt()
    product = Products.query.get(product_id)

    if product is None:
        response_body['message'] = "Producto no encontrado."
        return response_body, 404

    # Solo el dueño del producto o admin pueden modificarlo
    if claims['user_id'] != product.user_id and claims.get('role') != 'admin':
        response_body['message'] = "No autorizado para modificar este producto."
        return response_body, 403

    data = request.json
    product.title = data.get("title", product.title)
    product.description = data.get("description", product.description)
    product.price = data.get("price", product.price)
    product.available = data.get("available", product.available)
    product.location = data.get("location", product.location)
    product.image_url = data.get("image_url", product.image_url)
    product.tags = data.get("tags", product.tags)

    db.session.commit()
    response_body['results'] = product.serialize()
    return response_body, 200


@api.route('/products/<int:product_id>', methods=['DELETE'])
@jwt_required()
def delete_product(product_id):
    response_body = {}
    claims = get_jwt()
    product = Products.query.get(product_id)

    if product is None:
        response_body['message'] = "Producto no encontrado."
        return response_body, 404

    # Solo el dueño del producto o admin pueden eliminarlo
    if claims['user_id'] != product.user_id and claims.get('role') != 'admin':
        response_body['message'] = "No autorizado para eliminar este producto."
        return response_body, 403
    
    # Comprobar si el producto fue vendido
    sold = OrderItems.query.filter_by(product_id=product.id).first()
    if sold:
        product.was_sold = True 
        product.available = False
        db.session.commit()
        response_body['message'] = "Producto desactivado."
        return response_body, 200
    
    # Puedes eliminar el producto si no ha sido vendido
    db.session.delete(product)
    db.session.commit()
    response_body['message'] = "Producto eliminado correctamente."
    return response_body, 200


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
    current_user_id = get_jwt_identity()

    if 'user_id' not in data or 'product_id' not in data:
        return {"error": "Faltan user_id o product_id."}, 400

    if data['user_id'] != current_user_id:
        return {"error": "No autorizado para crear favoritos para otro usuario."}, 403

    fav = Favorites(
        user_id=data['user_id'],
        product_id=data['product_id']
    )

    db.session.add(fav)
    db.session.commit()

    return fav.serialize(), 201


@api.route('/favorites/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_favorite(id):
    fav = Favorites.query.get(id)
    if not fav:
        return {"error": "Favorito no encontrado."}, 404

    current_user_id = get_jwt_identity()
    claims = get_jwt()

    if fav.user_id != current_user_id:
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
    current_user_id = get_jwt_identity()
    data = request.get_json()

    required_fields = ['user_sender', 'user_receiver', 'content', 'created_at', 'review_date']
    if not all(field in data for field in required_fields):
        return {"error": "Faltan campos obligatorios."}, 400

    # Validar que user_sender sea el usuario logueado
    if data.get('user_sender') != current_user_id:
        return {"error": "No autorizado para enviar mensajes en nombre de otro usuario."}, 403

    try:
        created_at = datetime.strptime(data.get('created_at'), "%d-%m-%Y").date()
        review_date = datetime.strptime(data.get('review_date'), "%d-%m-%Y").date()
    except ValueError:
        return {"error": "Formato de fecha incorrecto. Usa DD-MM-YYYY."}, 400

    msg = Messages(
        user_sender=current_user_id,
        user_receiver=data.get('user_receiver'),
        content=data.get('content'),
        created_at=created_at,
        review_date=review_date
    )

    db.session.add(msg)
    db.session.commit()

    return msg.serialize(), 201


@api.route('/messages/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_message(id):
    current_user_id = get_jwt_identity()
    msg = Messages.query.get(id)
    if not msg:
        return {"error": "Mensaje no encontrado."}, 404

    # Solo el creador del mensaje puede eliminarlo
    if msg.user_sender != current_user_id:
        return {"error": "No autorizado para eliminar este mensaje."}, 403

    db.session.delete(msg)
    db.session.commit()

    return {"message": "Mensaje eliminado correctamente."}, 200


@api.route('/messages/<int:id>', methods=['PUT'])
@jwt_required()
def update_message(id):
    current_user_id = get_jwt_identity()
    msg = Messages.query.get(id)
    if not msg:
        return {"error": "Mensaje no encontrado."}, 404

    # Solo el creador del mensaje puede modificarlo
    if msg.user_sender != current_user_id:
        return {"error": "No autorizado para modificar este mensaje."}, 403

    data = request.json
    msg.content = data.get("content", msg.content)
    db.session.commit()
    return msg.serialize(), 200


# COMMENTS -------------------------------------------------------------------

@api.route('/comments', methods=['GET'])
@jwt_required()
def get_comments():
    comments = Comments.query.all()
    if not comments:
        return {"results": [], "message": "No hay comentarios."}, 200
    return {"results": [comment.serialize() for comment in comments]}, 200


@api.route('/comments/<int:comment_id>', methods=['GET'])
@jwt_required()
def get_comment(comment_id):
    comment = Comments.query.get(comment_id)
    if comment is None:
        return {"message": "Comentario no encontrado."}, 404
    return comment.serialize(), 200


@api.route('/comments', methods=['POST'])
@jwt_required()
def create_comment():
    current_user_id = get_jwt_identity()
    data = request.json
    # El usuario logueado es el dueño del comentario
    new_comment = Comments(
        user_id=current_user_id,
        product_id=data.get("product_id"),
        content=data.get("content")
    )
    db.session.add(new_comment)
    db.session.commit()
    return new_comment.serialize(), 201


@api.route('/comments/<int:comment_id>', methods=['PUT'])
@jwt_required()
def update_comment(comment_id):
    current_user_id = get_jwt_identity()
    comment = Comments.query.get(comment_id)
    if comment is None:
        return {"message": "Comentario no encontrado."}, 404

    # Solo el creador del comentario puede modificarlo
    if comment.user_id != current_user_id:
        return {"error": "No autorizado para modificar este comentario."}, 403

    data = request.json
    comment.content = data.get("content", comment.content)

    db.session.commit()
    return comment.serialize(), 200


@api.route('/comments/<int:comment_id>', methods=['DELETE'])
@jwt_required()
def delete_comment(comment_id):
    current_user_id = get_jwt_identity()
    user = Users.query.get(current_user_id)
    comment = Comments.query.get(comment_id)
    if comment is None:
        return {"message": "Comentario no encontrado."}, 404

    # Permitir eliminar si es dueño del comentario o si el usuario es admin
    if comment.user_id != current_user_id and user.role != 'admin':
        return {"error": "No autorizado para eliminar este comentario."}, 403

    db.session.delete(comment)
    db.session.commit()
    return {"message": "Comentario eliminado correctamente."}, 200

# ORDERS ---------------------------------------------------------------------

@api.route("/orders", methods=["GET"])
@jwt_required()
def orders():
    current_user = get_jwt_identity()
    user_orders = Orders.query.filter_by(user_id=current_user).all()
    return {"orders": [order.serialize() for order in user_orders]}, 200


# ORDER ITEMS ----------------------------------------------------------------

@api.route("/order-items", methods=["GET"])
@jwt_required()
def get_order_items():
    current_user = get_jwt_identity()

    items = db.session.query(OrderItems).join(Orders).filter(
        Orders.user_id == current_user).all()

    return {"order_items": [item.serialize() for item in items]}, 200


@api.route("/order-items/<int:item_id>", methods=["GET"])
@jwt_required()
def get_order_item(item_id):
    current_user = get_jwt_identity()

    item = db.session.query(OrderItems).join(Orders).filter(
        OrderItems.id == item_id,
        Orders.user_id == current_user).first()

    if not item:
        return {"error": "Item no encontrado o no autorizado."}, 404

    return {"order_item": item.serialize()}, 200


@api.route("/order-items", methods=["POST"])
@jwt_required()
def create_order_item():
    current_user = get_jwt_identity()
    data = request.get_json()

    order = Orders.query.filter_by(id=data['order_id'], user_id=current_user).first()
    if not order:
        return {"error": "Orden no encontrada o no autorizada."}, 403

    try:
        new_item = OrderItems(
            order_id=data['order_id'],
            product_id=data['product_id'],
            total=data['total']
        )
        db.session.add(new_item)
        db.session.commit()
        return {"order_item": new_item.serialize()}, 201
    except Exception as e:
        db.session.rollback()
        return {"error": str(e)}, 400


@api.route("/order-items/<int:item_id>", methods=["PUT"])
@jwt_required()
def update_order_item(item_id):
    current_user = get_jwt_identity()
    data = request.get_json()

    item = db.session.query(OrderItems).join(Orders).filter(
        OrderItems.id == item_id,
        Orders.user_id == current_user
    ).first()

    if not item:
        return {"error": "Item no encontrado o no autorizado."}, 404

    try:
        item.product_id = data.get("product_id", item.product_id)
        item.total = data.get("total", item.total)
        db.session.commit()
        return {"order_item": item.serialize()}, 200
    except Exception as e:
        db.session.rollback()
        return {"error": str(e)}, 400


@api.route("/order-items/<int:item_id>", methods=["DELETE"])
@jwt_required()
def delete_order_item(item_id):
    current_user = get_jwt_identity()

    item = db.session.query(OrderItems).join(Orders).filter(
        OrderItems.id == item_id,
        Orders.user_id == current_user
    ).first()

    if not item:
        return {"error": "Item no encontrado o no autorizado."}, 404

    db.session.delete(item)
    db.session.commit()
    return {"message": f"Item {item_id} eliminado correctamente."}, 200


# REGISTER---------------------------------------------------------------

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
        return {"msg": "Email already registered"}, 400

    user = Users(email=email,
                password=generate_password_hash(password),
                is_active=True,
                role=role,
                first_name=first_name,
                last_name=last_name)

    db.session.add(user)
    db.session.commit()

    claims = {'user_id': user.id,
              'role': user.role}

    access_token = create_access_token(identity=email, additional_claims=claims)

    return {"access_token": access_token,
            "results": user.serialize(),
            "message": "Usuario registrado correctamente"}, 201
 

# LOGIN ---------------------------------------

@api.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email", "").lower()
    password = data.get("password", "")

    if not email or not password:
        return {"msg": "Email and password are required"}, 400

    user = Users.query.filter_by(email=email, is_active=True).first()

    if not user or not check_password_hash(user.password, password):
        return {"msg": "Bad email or password"}, 401

    claims = {"user_id": user.id,
              "role": user.role}

    access_token = create_access_token(identity=email, additional_claims=claims)

    return {"message": "User logged in successfully",
            "access_token": access_token}, 200



# PROTECTED -------------------------------------

@api.route("/protected", methods=["GET"])
@jwt_required()
def protected():
    identity = get_jwt_identity()
    claims = get_jwt()

    user = Users.query.filter_by(email=identity).first()
    if not user:
        return {"error": "Usuario no encontrado"}, 404

    return {
        "current_user": identity,
        "claims": {"user_id": claims.get("user_id"),
                   "role": claims.get("")},
        "profile": user.serialize()}, 200

