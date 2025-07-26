from flask_sqlalchemy import SQLAlchemy
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
    id= db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.Date, nullable=False)
    content = db.Column(db.Text, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    user_to = db.relationship('Users', foreign_keys=[user_id],
                           backref=db.backref('comments', lazy='select'))
    product_to = db.relationship('Products', foreign_keys=[product_id],
                              backref=db.backref('comments', lazy='select'))

    def __repr__(self):
        return f'<Comments {self.id}>'

    def serialize(self):
        return {"id": self.id,
             "user_id": self.user_id,
             "product_id": self.product_id,
             "content": self.content,
             "created_at": self.created_at}


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
    created_at = db.Column(db.Date, nullable=False)
    review_date = db.Column(db.Date, nullable=False)
    content = db.Column(db.Text, nullable=False)
    user_sender = db.Column(db.Integer, db.ForeignKey('users.id'))
    user_receiver = db.Column(db.Integer, db.ForeignKey('users.id'))
    user_sender_to = db.relationship('Users', foreign_keys=[user_sender],
                           backref=db.backref('message_sent', lazy='select'))
    user_receiver_to = db.relationship('Users', foreign_keys=[user_receiver],
                              backref=db.backref('message_received', lazy='select'))

    def serialize(self):
        return {"id": self.id,
                "user_sender": self.user_sender,
                "user_receiver": self.user_receiver,
                "content": self.content,
                "created_at": self.created_at.isoformat(),
                "review_date": self.review_date.isoformat()}


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
    image_url = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    tags = db.Column(db.Enum('new', 'used', 'acceptable', name='tags'), nullable=False)
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
            'image_url': self.image_url,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'tags': self.tags,
            'was_sold': self.was_sold}
    