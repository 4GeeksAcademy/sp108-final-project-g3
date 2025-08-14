from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import JSON
from datetime import datetime, timezone

db = SQLAlchemy()


class Users(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(120), nullable=False)
    last_name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(), nullable=False)
    role = db.Column(db.Enum('vendedor', 'comprador', 'administrador', name='role'), nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    
    def __repr__(self):
        return f'<User {self.id} - {self.email}>'

    def serialize(self):
        return {'id': self.id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'email': self.email,
            'role': self.role,
            'is_active': self.is_active}


class Comments(db.Model):
    __tablename__ = 'comments'
    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    content = db.Column(db.Text, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    profile_user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Relación con el usuario que hace el comentario
    user = db.relationship('Users', foreign_keys=[user_id],
                          backref=db.backref('comments_made', lazy='select'))
    
    # Relación con el usuario cuyo perfil se comenta
    profile_user = db.relationship('Users', foreign_keys=[profile_user_id],
                                 backref=db.backref('profile_comments', lazy='select'))

    def __repr__(self):
        return f'<Comments {self.id}>'

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "profile_user_id": self.profile_user_id,
            "content": self.content,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "user_name": f"{self.user.first_name} {self.user.last_name}" if self.user else None
        }


class Orders(db.Model):
    __tablename__= 'orders'
    id= db.Column(db.Integer, primary_key=True)
    status = db.Column(db.Enum('pending', 'close', 'paid', 'canceled', name='status'), nullable=False)
    created_at = db.Column(db.Date, nullable=False)
    total = db.Column(db.Float, nullable=False)
    paid_at = db.Column(db.Date, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    user_to = db.relationship('Users', foreign_keys=[user_id],
                           backref=db.backref('orders', lazy='select'))
    
    def __repr__(self):
        return f'<Order {self.id} - user {self.user_id} - status {self.status}>'

    def serialize(self):
        return {"id": self.id,
             "user_id": self.user_id,
             "status": self.status,
             "created_at": self.created_at,
             "total": self.total,
             "paid_at": self.paid_at}


class OrderItems(db.Model):
    __tablename__ = 'order_items'
    id= db.Column(db.Integer, primary_key=True)
    total = db.Column(db.Float, nullable=False)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    order_to = db.relationship('Orders', foreign_keys=[order_id],
                           backref=db.backref('items', lazy='select'))
    product_to = db.relationship('Products', foreign_keys=[product_id],
                              backref=db.backref('order_items', lazy='select'))

    def __repr__(self):
        return f'<OrderItems {self.id}>'

    def serialize(self):
        return {"id": self.id,
             "order_id": self.order_id,
             "product_id": self.product_id,
             "total": self.total}


class Messages(db.Model):
    __tablename__ = 'messages'
    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    review_date = db.Column(db.DateTime, nullable=True)
    content = db.Column(db.Text, nullable=False)
    user_sender = db.Column(db.Integer, db.ForeignKey('users.id'))
    user_receiver = db.Column(db.Integer, db.ForeignKey('users.id'))
    user_sender_to = db.relationship('Users', foreign_keys=[user_sender],
                           backref=db.backref('message_sent', lazy='select'))
    user_receiver_to = db.relationship('Users', foreign_keys=[user_receiver],
                              backref=db.backref('message_received', lazy='select'))

    def __repr__(self):
        return f'<Messages {self.id} - from {self.user_sender} to {self.user_receiver}>'

    def serialize(self):
        try:
            return {
                "id": self.id,
                "user_sender": self.user_sender,
                "user_receiver": self.user_receiver,
                "content": self.content,
                "created_at": self.created_at.isoformat() if self.created_at else None,
                "review_date": self.review_date.isoformat() if self.review_date else None
            }
        except Exception as e:
            print(f"💥 Error serializando mensaje {self.id}: {str(e)}")
            return {
                "id": self.id,
                "user_sender": self.user_sender,
                "user_receiver": self.user_receiver,
                "content": self.content,
                "created_at": None,
                "review_date": None,
                "error": "Error en serialización"
            }


class Favorites(db.Model):
    __tablename__ = 'favorites'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'))
    user_to = db.relationship('Users', foreign_keys=[user_id],
                           backref=db.backref('favorites', lazy='select'))
    product_to = db.relationship('Products', foreign_keys=[product_id],
                              backref=db.backref('favorited_by', lazy='select'))

    def serialize(self):
        return {"id": self.id,
                "user_id": self.user_id,
                "product_id": self.product_id}


class Products(db.Model):
    __tablename__ = 'products'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=False)
    price = db.Column(db.Float, nullable=False)
    available = db.Column(db.Boolean, default=True, nullable=False)
    location = db.Column(db.String(120))
    image_urls = db.Column(JSON, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    tags = db.Column(db.Enum('new', 'used', 'acceptable', name='tags'), nullable=False)
    category = db.Column(
        db.Enum(
            'Coches',
            'Motos',
            'Motor y Accesorios',
            'Moda y Accesorios',
            'Tecnología y Electrónica',
            'Móviles y Tecnología',
            'Informática',
            'Deporte y Ocio',
            'Bicicletas',
            name='product_category'
        ),
        nullable=False
    )
    was_sold = db.Column(db.Boolean, default=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    user_to = db.relationship('Users', foreign_keys=[user_id],
                           backref=db.backref('on_sale', lazy='select'))
    
    def __repr__(self):
        return f'<Product {self.id} - {self.title}>'

    def serialize(self):
        return {'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'description': self.description,
            'price': self.price,
            'available': self.available,
            'location': self.location,
            'image_urls': self.image_urls or [],
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'tags': self.tags,
            'category': self.category,
            'was_sold': self.was_sold}
    