"""Main module for the server, inits all the configuration."""
import os
import sqlite3
import csv
from flask import Flask, request
from flask import _app_ctx_stack
from flask_login import LoginManager
from flask_babel import Babel
from .User import User

# Init app and some config
APP = Flask(__name__, instance_relative_config=True)
APP.config.from_object('config')
APP.config.from_pyfile('config.py', silent=True)

# Upload folder config
UPLOAD_FOLDER = os.path.join(os.path.dirname(
    os.path.realpath(__file__)), 'static', 'uploads')
APP.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# User management
LOGIN_MANAGER = LoginManager()
LOGIN_MANAGER.login_view = "login"
LOGIN_MANAGER.session_protection = "strong"
LOGIN_MANAGER.init_app(APP)


@LOGIN_MANAGER.user_loader
def user_loader(user_id):
    """
    Search for the user with the corresponding id.

    :param unicode user_id: The id of the user we are looking for.

    :returns user: The requested user or None if it is not found.
    :rtype user: User or None

    """
    if not email_in_db(user_id):
        return None
    user = User()
    user.id = user_id
    return user


# Database management
DATABASE = os.path.join(os.path.dirname(
    os.path.realpath(__file__)), 'users.db')


def query_db(query, args=(), one=False):
    """
    Make a query into the database.

    :param str query: The query we want to do on the database.
    :param args: The parameters the query should have (if the query has '?' in it).
    :type args: tuple of str, optional
    :param one: If the return value should be the first row queried or all of it.
    :type one: bool, optional

    :returns: The row or set of rows the query has returned or None if empty and one == True.
    :rtype: sqlite3.Row or set of sqlite3.Row or None

    """
    cursor = get_db().execute(query, args)
    # Requested values
    requested_values = cursor.fetchall()
    cursor.close()
    return (requested_values[0] if requested_values else None) if one else requested_values


def email_in_db(email):
    """
    Check if an email is in the database.

    :param str email: The email we are looking for.

    :returns: True if the database contains the email, false otherwise.
    :rtype: bool

    """
    query = query_db(
        'select count(email) as num from users where email = ?', (email,), True)
    return query['num'] != 0


def get_db():
    """
    Return a reference to the database.

    It is created just once until it is disposed.

    :returns users_db: The connection to the database.
    :rtype: sqlite3.Connection

    """
    users_db = getattr(_app_ctx_stack.top, '_database', None)
    if users_db is None:
        users_db = sqlite3.connect(DATABASE)
        users_db.row_factory = sqlite3.Row
    return users_db


@APP.teardown_appcontext
def close_connection(exception):
    """
    Handle the conventional way to close the connection to the database.

    Fired when the context is about to be dropped.

    :param exception: If it was called because of an exception, it will receive an error object.
    :type exception: Exception or None

    """
    # Just to note that we could use exception to do a treatment.
    # To log something in a database of log file, for example.
    if not exception or exception:
        users_db = getattr(_app_ctx_stack.top, '_database', None)
        if users_db is not None:
            users_db.close()


def init_db():
    """Init the database with the initial tables with the schema in 'schema.sql'."""
    with APP.app_context():
        users_db = get_db()
        with APP.open_resource('./sql_scripts/schema.sql', mode='r') as file_pointer:
            users_db.executescript(file_pointer.read())
        users_db.commit()

def import_users_to_db(filename='users_to_import.csv'):
    """
    Get new users from a csv into actual users database.

    :param str filename: The filename of the csv where we have the users into.
    """
    with APP.app_context():
        users_db = get_db()
        with APP.open_instance_resource(filename, mode='r') as file_pointer:
            for row in csv.DictReader(file_pointer):
                email = row['email']
                user_in_db = email_in_db(email)
                if not user_in_db:
                    users_db.execute('insert into users (email) values (?)', (email,))
            users_db.commit()

# Language support
BABEL = Babel(APP)

@BABEL.localeselector
def get_locale():
    """
    Pretend to guess the match that does the best.

    :returns: The prefered language for the browser request.

    """
    #It returns a list of type Locale, and we need it to be str type.
    translations_available = (str(e) for e in BABEL.list_translations())
    return request.accept_languages.best_match(translations_available)

# Import views
import MyApp.views
