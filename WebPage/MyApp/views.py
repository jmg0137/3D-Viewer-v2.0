"""It contains the views that will be displayed, and also some auxiliar functions."""
import os
import time, json, hashlib
import requests
from flask import request, render_template, flash, abort, \
    send_from_directory, redirect, url_for, jsonify
from werkzeug.utils import secure_filename
from flask_login import login_user, login_required, logout_user, current_user
from flask_babel import gettext
from . import APP, email_in_db, check_rol, user_loader
from .User import User
from .forms import EmailPasswordForm, UploadForm


#Variable that have the actual user role
actualUserInfo = dict()

#We declare the url directions
base_url = 'https://ubuvirtual.ubu.es/'
base_url2 = 'https://localhost/'
api_endpoint = '/login/token.php'
api_endpoint2 = '/login/index.php'
api_function_endpoint = 'webservice/rest/server.php'

def get_models_list_with_extensions(extensions):
    """
    Return the list of files with one or more specific extension.

    :param tuple extensions: The list of extensions to filter the list of files.

    :returns: The list of filtered files.
    :rtype: list of str

    """
    files = []
    folder = APP.config['UPLOAD_FOLDER']
    for element in os.listdir(folder):
        if os.path.isfile(os.path.join(folder, element)):
            for extension in extensions:
                if element.endswith("." + extension):
                    files.append(element)
    return files

def get_models_as_reources(extensions):
    """
    Return the list of files with one or more specific extension, being this files moodle resources

    :param tuple extensions: The list of extensions to filter the list of files

    :returns: The list of filtered files
    :rtype: list of str

    """
    files, userToken, format, wsfunction, courseid = [], actualUserInfo[current_user.get_id()][1], 'json', 'mod_resource_get_resources_by_courses', 8688

    #We declare the rol request params
    paramsRol = {"wstoken": userToken,
              "moodlewsrestformat": format,
              "wsfunction": wsfunction,
              "courseid": courseid,}

    return files

def exist(filename):
    """
    Tells if a filename exists into the upload folder.

    :param str filename: The filename to test its existance.

    :returns: The existance of the file.
    :rtype: bool

    """
    return os.path.isfile(os.path.join(APP.config['UPLOAD_FOLDER'], secure_filename(filename)))


@APP.route('/')
def index():
    """
    Redirects to the main view.

    :returns: The response with 'ply_models' destination.
    :rtype: flask.Response

    """
    return redirect(url_for('ply_shelf'))


@APP.route('/logout')
@login_required
def logout():
    """
    Log out a user of the session and redirects it to the main view.

    :returns: The response with '/' destination.
    :rtype: flask.Response

    """
    logout_user()
    return redirect((url_for('index')))


@APP.route('/login', methods=["GET", "POST"])
def login():
    """
    Try to log in a user, if all the requirements are correct.

    :returns: The response with 'ply_models' destination if the requirements
        are correct, with 'login' destination otherwise.
    :rtype: flask.Response

    """
    global actualUserInfo, base_url, api_endpoint, api_function_endpoint
    form = EmailPasswordForm()
    if form.validate_on_submit():
        email = form.email.data
        password = form.password.data

        if not email_in_db(email):
            flash(gettext("You are not allowed, contact administrator"))
            return redirect(url_for('login'))

        #We declare the login params
        paramsLogin = {"username": email,
                  "password": password,
                  "service":  "moodle_mobile_app"}

        #We take the login response
        responseLogin = requests.get(
                        base_url2 + api_endpoint,
                        params=paramsLogin, verify = False
                ).json()

        if APP.debug is True or \
                "token" in responseLogin.keys():

            userToken, format, wsfunction, courseid = responseLogin['token'], 'json', 'core_enrol_get_enrolled_users', 8688

            #We declare the rol request params
            paramsRol = {"wstoken": userToken,
                      "moodlewsrestformat": format,
                      "wsfunction": wsfunction,
                      "courseid": courseid,}

            #We take the rol response
            responseRol = requests.get(
                            base_url + api_function_endpoint,
                            params=paramsRol
                    ).json()

            rol = None
            for field in responseRol:
                if field['email'] == email:
                    rol = field['roles'][0]['name']

            #Set role for current user
            actualUserInfo[email] = (rol, userToken)
       
            if actualUserInfo[email] != None:
                user = user_loader(email)
                login_user(user_loader(email))
                return redirect(url_for('ply_shelf'))
            else:
                flash(gettext("User is not coursing this subject"))
                return redirect(url_for('login'))
        else:
            flash(gettext("User or password incorrect"))
            return redirect(url_for('login'))
    else:
        return render_template('login.html', form=form)



@APP.route('/ply_models/')
@login_required
def ply_shelf():
    """
    Create a view to show all the models with its thumbnails.

    :returns: A view with all the model's thumbnails.
    :rtype: flask.Response

    """
    global actualUserInfo
    allowed_model_extensions = APP.config['ALLOWED_MODEL_EXTENSIONS']
    models = get_models_list_with_extensions(allowed_model_extensions)
    return render_template('ply_models.html', files = models, userRol = actualUserInfo)


@APP.route('/ply_models/<string:filename>')
@login_required
def show_ply_models(filename):
    """
    Give the visor with the specified model.

    :param str filename: The model we want to visualize.

    :returns: The visor with the selected file, a 404 if the model
        don't exist.
    :rtype: flask.Response

    """
    global actualUserInfo
    if exist(filename):
        return render_template('visor.html', userRol = actualUserInfo)
    else:
        abort(404)


@APP.route('/upload', methods=["GET", "POST"])
@login_required
def upload():
    """
    Allow to upload new models to the server.

    :returns: Always returns the upload form, even when we already have
        uploaded a model.
    :rtype: flask.Response

    """
    form = UploadForm()
    if form.validate_on_submit():
        file = request.files['file']
        file.save(os.path.join(
            APP.config['UPLOAD_FOLDER'], secure_filename(file.filename)))
        flash(gettext("File '%(filename)s' successfully uploaded",
                      filename=file.filename))
        return render_template('upload.html', form=form)
    else:
        return render_template('upload.html', form=form)


@APP.route('/preview/<string:filename>')
@login_required
def preview(filename):
    """
    Try to get the thumbnail of a model.

    It can find the thumbnail if it has the same name of the model and the '.png' extension.

    :param str filename: The filename of the model we want the thumbnail of.

    :returns: If the file doen't exist, it response with a 404 error.
              Whenever the file exists: if there is a custom thumbnail for it, return it;
              if there isn't, return a default one.

    :rtype: flask.Response

    """
    if exist(filename):
        # First we look for a file in png extension with the same name.
        route, _ = os.path.splitext(filename)
        png = route + '.png'
        if os.path.isfile(os.path.join(APP.config['UPLOAD_FOLDER'], png)):
            return send_from_directory(APP.config['UPLOAD_FOLDER'],
                                       secure_filename(png))
        else:
            return send_from_directory(APP.config['UPLOAD_FOLDER'],
                                       secure_filename('number-1_icon-icons.com_51021.png'))
    else:
        abort(404)

@APP.route('/_add_checksum_to_json', methods=["POST"])
def finish_json():
    """
    Make a response with the requested json.

    :returns: A response with the json adding some values.
    :rtype: flask.Response

    """
    json_data = request.get_json()
    #With just the integer part is way enough.
    json_data["timestamp"] = int(time.time())
    json_md5 = hashlib.md5(json.dumps(json_data, sort_keys=True) \
        .encode('utf-8')) \
        .hexdigest()
    json_data["checksum"] = json_md5
    return jsonify(json_data)
