"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from flask_cors import CORS
from flask_jwt_extended import get_jwt_identity, jwt_required, create_access_token
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
    # TODO: verificar que el uisusario del token es el que quiera modificar sea el mismo o es admin
    data = request.json
    user.first_name = data.get("first_name", user.first_name)
    user.last_name = data.get("last_name", user.last_name)
    user.email = data.get("email", user.email)
    # el usuario puede cambiarse de role?? 
    # si era vendedor y se quiere psasar a comprador que hacemos con los productos que tenía?? 
    # user.role = data.get("role", user.role)
    # el usuario cambia a is_active cuando se da de baja, aquí no.
    # user.is_active = data.get("is_active", user.is_active)
    db.session.commit()
    response_body['results'] = user.serialize()
    return response_body, 200


@api.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    response_body = {}
    user = Users.query.get(user_id)
    if user is None:
        response_body['messsage'] = "Usuario no encontrado"
        return {"message": "Usuario no encontrado."}, 404
    # TODO: verificar que el uisusario del token es el que quiera modificar sea el mismo o es admin
    user.is_active = False
    db.session.commit()
    response_body['results'] = "Usuario desactivado correctamente."
    return response_body, 200


# PRODUCTS -------------------------------------------------------------------
@api.route('/products', methods=['GET'])
def get_products():
    products = Products.query.all()
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
    data = request.json
    # TODO: si el ususario no es vendedor, no puede crear un producto.
    # TODO: verificar si tenemos todos los campos obligatorios
    # Si no estan todos los campos obligatorios, avisar al usuario que debe completarlos
    new_product = Products(user_id=data.get("user_id"),
                            title=data.get("title"),
                            description=data.get("description"),
                            price=data.get("price"),
                            available=data.get("available", True),
                            localitation=data.get("localitation"),
                            image_url=data.get("image_url"),
                            tags=data.get("tags"))
    db.session.add(new_product)
    db.session.commit()
    response_body['results'] = new_product.serialize()
    return response_body, 201


# hay que revisar todo para ver quien puede hacer que.
# recordar que el token tienen 
@api.route('/products/<int:product_id>', methods=['PUT'])
def update_product(product_id):
    product = Products.query.get(product_id)
    if product is None:
        return {"message": "Producto no encontrado."}, 404

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
        return {"message": "Producto no encontrado."}, 404

    db.session.delete(product)
    db.session.commit()
    return {"message": "Producto eliminado correctamente."}, 200


# FAVORITES ------------------------------------------------------------------

@api.route('/favorites', methods=['GET'])
def get_favorites():
    rows = Favorites.query.all()
    if not rows:
        return {"message": "No hay favoritos."}, 404

    return {
        "message": "Lista de favoritos.",
        "results": [fav.serialize() for fav in rows]
    }, 200


@api.route('/favorites', methods=['POST'])
def create_favorite():
    data = request.get_json()

    if 'user_id' not in data or 'product_id' not in data:
        return {"error": "Faltan user_id o product_id."}, 400

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
        return {"error": "Favorito no encontrado."}, 404

    db.session.delete(fav)
    db.session.commit()

    return {"message": "Favorito eliminado correctamente."}, 200


# MESSAGES -------------------------------------------------------------------

@api.route('/messages', methods=['GET'])
def get_messages():
    rows = Messages.query.all()
    if not rows:
        return {"message": "No hay mensajes."}, 400
    return {
        "results": [row.serialize() for row in rows],
        "message": "Lista de mensajes."
    }, 200


@api.route('/messages', methods=['POST'])
def create_message():
    data = request.get_json()

    required_fields = ['user_sender', 'user_receiver', 'content', 'created_at', 'review_date']
    if not all(field in data for field in required_fields):
        return {"error": "Faltan campos obligatorios."}, 400

    try:
        created_at = datetime.strptime(data.get('created_at'), "%d-%m-%Y").date()
        review_date = datetime.strptime(data.get('review_date'), "%d-%m-%Y").date()
    except ValueError:
        return {"error": "Formato de fecha incorrecto. Usa DD-MM-YYYY."}, 400

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
        return {"error": "Mensaje no encontrado."}, 404

    db.session.delete(msg)
    db.session.commit()

    return {"message": "Mensaje eliminado correctamente."}, 200


# COMMENTS -------------------------------------------------------------------

@api.route('/comments', methods=['GET'])
def get_comments():
    comments = Comments.query.all()
    if not comments:
        return {"results": [], "message": "No hay comentarios."}, 200
    return {"results": [comment.serialize() for comment in comments]}, 200


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


# LOGIN REGISTER PROTECTED ------------------------------------------------------

@api.route("/login", methods=["POST"])
def login():
    response_body = {}
    data = request.json 
    username = request.json.get("username", None)
    email = data.get("email", None).lower()
    password = request.json.get("password", None)
    user = db.session.execute(db.select(Users).where(Users.email == email,
                                                     Users.password == password,
                                                     Users.is_active == True)).scalar()
    # TODO: FIX: tenemos que eliminar este "test" verificar y validar con la BBDD.
    if username != "test" or password != "test":
        return jsonify({"msg": "Bad username or password"}), 401
    claims = {'user_id': user[id]}  # TODO: FIX: aquí falta enviar el role del usuario.  
    access_token = create_access_token(identity=username, additional_claims=claims)
    response_body['message'] = 'User logged ok'  
    response_body['access_token'] = access_token
    return response_body, 200


@api.route("/protected", methods=["GET"])
@jwt_required()
def protected():
    response_body = {}
    # Access the identity of the current user with get_jwt_identity
    current_user = get_jwt_identity()
    additional_claims = get_jwt()  # Los datos adicionales
    response_body['current_user'] = current_user
    response_body['aditional_data'] = additional_claims
    return response_body, 200


@api.route('/register', methods=['POST'])
def register():
    response_body = {}
    data = request.json
    email = data.get('email', 'user@email.com').lower()
    # verificar que el mail no exista en mi DB
    user = Users()
    user.email = email
    user.password = data.get('password', '1')
    user.is_active = True
    user.is_admin = data.get('is_admin', False)
    user.first_name = data.get('first_name', None)
    user.last_name = data.get('last_name', None)
    db.session.add(user)
    db.session.commit()
    claims = {'user_id': user.serialize()['id'],
              'is_admin': user.serialize()['is_admin']}
    access_token = create_access_token(identity=email, additional_claims=claims)

    response_body['access_token'] = access_token
    response_body['results'] = user.serialize()
    response_body['message'] = 'Usuario registrado ok'
    return response_body, 201


