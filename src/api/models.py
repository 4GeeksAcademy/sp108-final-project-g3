from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, JSON, Enum, Float, DateTime, Text
from datetime import datetime, timezone

db = SQLAlchemy()


class Users(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(120), nullable=False)
    last_name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(80), nullable=False)
    role = db.Column(db.Enum('vendedor', 'comprador', 'administrador', name='user_roles'), nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)

    def __repr__(self):
        return f'<User {self.id} - {self.email}>'

    def serialize(self):
        return {
            'id': self.id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'email': self.email,
            'role': self.role,
            'is_active': self.is_active
        }


class Comments(db.Model):
    __tablename__ = 'comments'
    id= db.Column(db.Integer, primary_kay=True)
    user_id = db.Column(db.Integer, db.Foreignkey('users.id'), nullable=False)
    product_id = db.Column(db.Integer, db.Foreignkey('product.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.Date, nullable=False)

    def __repr__(self):
        return f'<Comments {self.id}>'

    def serialize(self):
        return {"id": self.id,
             "user_id": self.user_id,
             "product_id": self.product_id,
             "content": self.content,
             "created_ad": self.created_ad}


class Orders(db.Model):
    __tablename__= 'orders'
    id= db.Column(db.Integer, primary_kay=True)
    user_id = db.Column(db.Integer, db.Foreignkey('users_id'), nullable=False)
    status = db.Column(
        db.Enum('Pending', 'Close', 'Paid', 'Canceled', name='status_type'), nullable=False)
    created_at = db.Column(db.Date, nullable=False)
    total = db.Column(db.Float, nullable=False)
    paid_at = db.Column(db.Date, nullable=False)

    def __repr__(self):
        return f'<Order {self.id} - user {self.user_id} - status {self.status}>'

    def serialize(self):
        return {"id": self.id,
             "user_id": self.user_id,
             "status": self.status,
             "created_at": self.created_at,
             "total": self.total,
             "paid_at": self.paid_at,}


class OrderItems(db.Model):
    __tablename__ = 'order_items'
    id= db.Column(db.Integer, primary_kay=True)
    order_id= db.Column(db.Integer, db.Foreignkey('order_id'), nullable=False)
    product_id= db.Column(db.Integer, db.Foreignkey('order_id'), nullable=False)
    total = db.Column(db.Float, nullable=False)

    def __repr__(self):
        return f'<OrderItems {self.id}>'

    def serialize(self):
        return {"id": self.id,
             "order_id": self.order_id,
             "product_id": self.product_id,
             "price": self.price,}


class Messages(db.Model):
    __tablename__ = 'messages'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    user_to = db.Column(db.Integer, db.ForeignKey('users.id'))
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.Date, nullable=False)
    review_date = db.Column(db.Date, nullable=False)

    def serialize(self):
        return {"id": self.id,
                "user_id": self.user_id,
                "user_to": self.user_to,
                "content": self.content,
                "created_at": self.created_at.isoformat(),
                "review_date": self.review_date.isoformat()}


class Favorites(db.Model):
    __tablename__ = 'favorites'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'))
    user = db.relationship('Users', foreign_keys=[user_id],
                           backref=db.backref('favorites', lazy='select'))
    product = db.relationship('Products', foreign_keys=[product_id],
                              backref=db.backref('favorited_by', lazy='select'))

    def serialize(self):
        return {"id": self.id,
                "user_id": self.user_id,
                "product_id": self.product_id}


class Product(db.Model):
    __tablename__ = 'product'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=False)
    price = db.Column(db.Float, nullable=False)
    available = db.Column(db.Boolean, default=True, nullable=False)
    localitation = db.Column(db.String(120))
    image_url = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    tags = db.Column(JSON, nullable=True)

    def __repr__(self):
        return f'<Product {self.id} - {self.title}>'

    def serialize(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'description': self.description,
            'price': self.price,
            'available': self.available,
            'localitation': self.localitation,
            'image_url': self.image_url,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'tags': self.tags
        }