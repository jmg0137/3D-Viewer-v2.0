"""The forms of the application are defined here."""
from flask_wtf import FlaskForm
from flask_wtf.file import FileField, FileRequired, FileAllowed
from wtforms import StringField, PasswordField, SubmitField
from wtforms.validators import InputRequired, Email
from flask_babel import lazy_gettext, gettext
from flask import Markup
from . import APP


class EmailPasswordForm(FlaskForm):
    """
    It creates a form for logging in.

    It is made with a text field that only accepts email as inputs,
    another text field that renders and hides its text for password,
    and a submit button.
    """

    email = StringField(lazy_gettext(u"Email"),
                        validators=[
                            InputRequired(Markup("<div class=\"error\"><i class=\"fa fa-times-circle\"></i>" + (lazy_gettext(u"Email required")) + "</div>")),
                            Email(Markup("<div class=\"error\"><i class=\"fa fa-times-circle\"></i>" + (lazy_gettext(u"Introduce a valid email")) + "</div>"))])
    password = PasswordField(lazy_gettext(u"Password"),
                             validators=[InputRequired(Markup("<div class=\"error\"><i class=\"fa fa-times-circle\"></i>" + (lazy_gettext(u"Password required")) + "</div>"))])
    submit = SubmitField(lazy_gettext(u"Enter"))


class UploadForm(FlaskForm):
    """
    It creates a form made for uploads.

    It creates a form with a file field selector that requires a file
    to be selected in order to submit, and that only accepts files
    with an extension that is defined as "ALLOWED_MODEL_EXTENSIONS"
    into the config file.
    It also has a submit button.
    """

    ALLOWED_EXTENSIONS = APP.config["ALLOWED_MODEL_EXTENSIONS"]
    file = FileField(lazy_gettext(u"Browse files"),
                     validators=[
                         FileRequired(lazy_gettext(u"No file was selected")),
                         FileAllowed(ALLOWED_EXTENSIONS, lazy_gettext(u"Only ply!"))])
    submit = SubmitField(lazy_gettext(u"Upload"))
