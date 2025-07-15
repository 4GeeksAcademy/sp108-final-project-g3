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

    