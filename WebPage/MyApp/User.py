"""The User class, to support common functionality on users."""
from flask_login import UserMixin


class User(UserMixin):
    """Now it only has the UserMixin class functionality."""

    def __init__(self, id, rol = None):
        self.id = id
        self.rol = rol

    def get_id(self):
        return self.id
    
    def get_rol(self):
        return self.rol

    def set_rol(self, newRol):
        self.rol = newRol