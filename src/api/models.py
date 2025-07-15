from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean
from sqlalchemy.orm import Mapped, mapped_column


db = SQLAlchemy()


class Users(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(80), unique=False, nullable=False)
    is_active = db.Column(db.Boolean(), unique=False, nullable=False)

    def __repr__(self):
        return f'<User {self.email}>'

    def serialize(self):
        # do not serialize the password, its a security breach
        return {'id': self.id,
                'email': self.email, 
                'is_active': self.is_active}


class Comments(db.Model):
    __tablename__ = 'comments'
    id= db.Column(db.Integer, primary_kay=True)
    user_id = db.Column(db.Integer, db.Foreignkey('users.id'), nullable=False)
    product_id = db.Column(db.Integer, db.Foreignkey('product.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.Date, nullable=False)


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

    