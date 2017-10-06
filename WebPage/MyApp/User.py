"""The User class, to support common functionality on users."""
from flask_login import UserMixin


class User(UserMixin):
    """Now it only has the UserMixin class functionality."""

    def __init__(self, id):
        self.id = id

    def get_id(self):
        return self.id
