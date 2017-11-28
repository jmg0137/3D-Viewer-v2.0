"""It contains the views that will be displayed, and also some auxiliar functions."""
import os
import shutil
import time, json, hashlib
import requests
from flask import request, render_template, flash, abort, \
    send_from_directory, redirect, url_for, jsonify
from werkzeug.utils import secure_filename
from flask_login import login_user, login_required, logout_user, current_user
from flask_babel import gettext
from . import APP, email_in_db, user_loader
from .User import User
from .forms import EmailPasswordForm, UploadForm
from .read_write_ply import *


#Variable that have the actual user role
actualUserInfo = dict()

#Variable with exercise counter
exerciseCounter = dict()

#We declare the url directions
base_url = 'https://ubuvirtual.ubu.es/'
base_url_miMoodle = 'https://localhost/'
api_endpoint = '/login/token.php'
api_function_endpoint = 'webservice/rest/server.php'

#We declare the course id
courseid = 8688
courseid_miMoodle = 2

#Seed to generate random numbers
seed = None

#Count lines
counter = 0

#Coordenates
pointsXYZ = ['x','y','z']

def myRandom(num):
    """
    Return a random number.

    :param num: num to calculate the random

    :returns: The random number.
    :rtype: int

    """
    return 7 * num % 11


def applyChange(num):
    """
    Return the number encripted.

    :param num: num to encript

    :returns: The encripted number.
    :rtype: float

    """
    global seed,counter

    #Only change value to the even lines
    if counter % 4 == 0:
        seed = myRandom(seed)
        counter += 1
        return int((num * (seed * 10)) + (seed * 100))
    else:
        counter += 1
        return num


def getInitialSeed():
    """
    Return the intial seed to make random numbers.

    :returns: The initial seed.
    :rtype: int

    """
    return 1


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


def get_exercise_list_for_model(filename):
    """
    Return the list of files with one or more specific extension.

    :param tuple extensions: The list of extensions to filter the list of files.

    :returns: The list of filtered files.
    :rtype: list of str

    """
    files = []
    if os.path.exists(os.path.join(APP.config['EXERCISE_FOLDER'], secure_filename(filename.split(".")[0]))):
        folder = os.path.join(APP.config['EXERCISE_FOLDER'], secure_filename(filename.split(".")[0]))
    else:
        return files

    for element in os.listdir(folder):
        files.append(element)

    return files


def exist(filename):
    """
    Tells if a filename exists into the Moodle resources.

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
    return redirect(url_for('login'))


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
    global actualUserInfo, base_url, api_endpoint, api_function_endpoint, courseid, courseid_miMoodle
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
                        base_url_miMoodle + api_endpoint,
                        params=paramsLogin, verify = False
                ).json()

        if APP.debug is True or \
                "token" in responseLogin.keys():

            userToken, format, wsfunction = responseLogin['token'], 'json', 'core_enrol_get_enrolled_users'

            #We declare the rol request params
            paramsRol = {"wstoken": userToken,
                      "moodlewsrestformat": format,
                      "wsfunction": wsfunction,
                      "courseid": courseid_miMoodle}

            #We take the rol response
            responseRol = requests.get(
                            base_url_miMoodle + api_function_endpoint,
                            params=paramsRol, verify = False
                    ).json()

            rol = None
            for field in responseRol:
                if field['email'] == email:
                    rol = field['roles'][0]['name']

            #Set role for current user
            actualUserInfo[email] = rol
       
            if actualUserInfo[email] != None:
                user = user_loader(email)
                login_user(user_loader(email))

                return redirect(url_for('main'))
            else:
                flash(gettext("User is not coursing this subject"))
                return redirect(url_for('login'))
        else:
            flash(gettext("User or password incorrect"))
            return redirect(url_for('login'))
    else:
        return render_template('login.html', form=form)


@APP.route('/main/')
@login_required
def main():
    """
    Create a view to select how do you want to work (see model, or add exercises to one model).

    :returns: A view with two big folders.
    :rtype: flask.Response

    """
    global actualUserInfo
    if actualUserInfo[current_user.id] == 'Profesor':
        return render_template('main_page.html', userRol = actualUserInfo)
    else:
        return render_template('main_page_user.html', userRol = actualUserInfo)


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


@APP.route('/ply_models_exercise/')
@login_required
def show_exercise_templates():
    """
    Create a view to show all the models with its thumbnails to show the models' solutions.

    :returns: A view with all the model's thumbnails.
    :rtype: flask.Response

    """
    global actualUserInfo
    allowed_model_extensions = APP.config['ALLOWED_MODEL_EXTENSIONS']
    models = get_models_list_with_extensions(allowed_model_extensions)
    return render_template('ply_models_exercise.html', files = models, userRol = actualUserInfo)


@APP.route('/ply_models_exercises/<string:filename>')
@login_required
def show_ply_models_exercise_templates(filename):
    """
    Give the exercise solutions with the specified model.

    :param str filename: The model we want to visualize.

    :returns: The exercise solution with the selected file, a 404 if the model
        don't exist.
    :rtype: flask.Response

    """
    global actualUserInfo
    folders = get_exercise_list_for_model(filename)
    if exist(filename):

         #We create a folder to do exercises in the model we are uploading
        if not os.path.exists(os.path.join(APP.config['EXERCISE_FOLDER'], secure_filename(filename.split(".")[0]))):
            os.makedirs(os.path.join(APP.config['EXERCISE_FOLDER'], secure_filename(filename.split(".")[0])))

        return render_template('models_solutions_list.html', userRol = actualUserInfo, file = filename, files = folders)
    else:
        abort(404)


@APP.route('/ply_models_do_exercise/<string:filename>')
@login_required
def show_ply_models_exercise(filename):
    """
    Give the visor with the specified model to make an exercise.

    :param str filename: The model we want to visualize.

    :returns: The visor with the selected file to make an exercise, a 404 if the model
        don't exist.
    :rtype: flask.Response

    """
    global actualUserInfo, exerciseCounter

    nFolders = get_exercise_list_for_model(filename)

    if len(nFolders) == 0:
        exerciseCounter[filename] = 0
    else:
        exerciseCounter[filename] = len(nFolders)
        while os.path.exists(os.path.join(APP.config['EXERCISE_FOLDER'], secure_filename(filename.split(".")[0]), secure_filename('Ejercicio_' + filename.split(".")[0] + '_' + str(exerciseCounter[filename])))):
            exerciseCounter[filename] += 1

    if exist(filename):
         #We create a folder to do exercises in the model we are uploading
        if not os.path.exists(os.path.join(APP.config['EXERCISE_FOLDER'], secure_filename(filename.split(".")[0]), secure_filename('Ejercicio_' + filename.split(".")[0] + '_' + str(exerciseCounter[filename])))):
            exercise = 'Ejercicio_' + filename.split(".")[0] + '_' + str(exerciseCounter[filename])
            os.makedirs(os.path.join(APP.config['EXERCISE_FOLDER'], secure_filename(filename.split(".")[0]), secure_filename(exercise)))

        return render_template('visor_exercise.html', userRol = actualUserInfo, ex = exercise, file = filename)
    else:
        abort(404)


@APP.route('/ply_models_edit_exercise/<string:exercise>/<string:filename>')
@login_required
def edit_ply_models_exercise(exercise, filename):
    """
    Give the visor with the specified exercise to edit an exercise.

    :param str filename: The exercise we want to edit.

    :returns: The visor with the selected file to make an exercise, a 404 if the model
        don't exist.
    :rtype: flask.Response

    """
    global actualUserInfo

    if exist(filename):
        return render_template('visor_exercise.html', userRol = actualUserInfo, ex = exercise, file = filename)
    else:
        abort(404)


@APP.route('/_delete', methods=["POST"])
def delete():
    """
    Delete dir exercise.

    :param str filename: The filename of the model we want to delete.

    :returns: If the file doen't exist, it response with a 404 error.
              Whenever the file exists: if there is a custom thumbnail for it, return it;
              if there isn't, return a default one.

    :rtype: flask.Response

    """
    json_data = request.get_json()
    filename = json_data["filename"]

    if os.path.exists(os.path.join(APP.config['EXERCISE_FOLDER'], secure_filename(filename.split("_")[1]), secure_filename(filename))):
        shutil.rmtree(os.path.join(APP.config['EXERCISE_FOLDER'], secure_filename(filename.split("_")[1]), secure_filename(filename)))

    return jsonify(json_data)


@APP.route('/upload', methods=["GET", "POST"])
@login_required
def upload():
    """
    Allow to upload new models to the server.

    :returns: Always returns the upload form, even when we already have
        uploaded a model.
    :rtype: flask.Response

    """
    global seed

    #We initialize the seed each time we access to the upload page
    #seed = getInitialSeed()

    form = UploadForm()
    if form.validate_on_submit():
        file = request.files['file']

        #File encription
        if file.filename.split(".")[1] != "png":

            #We first upload the file
            file.save(os.path.join(
                APP.config['UPLOAD_FOLDER'], secure_filename(file.filename)))

            #We create a folder to do exercises in the model we are uploading
            if not os.path.exists(os.path.join(APP.config['EXERCISE_FOLDER'], secure_filename(filename.split(".")[0]))):
                os.makedirs(os.path.join(APP.config['EXERCISE_FOLDER'], secure_filename(filename.split(".")[0])))

            #Then we encript the uploaded file
            fileToUpload = read_ply(os.path.join(
                APP.config['UPLOAD_FOLDER'], secure_filename(file.filename)))

            for coord in pointsXYZ:
                seed = getInitialSeed()
                fileToUpload['points'][coord] = list(map(applyChange, fileToUpload['points'][coord]))

            write_ply(os.path.join(
                APP.config['UPLOAD_FOLDER'], secure_filename(file.filename)), fileToUpload['points'], fileToUpload['mesh'], True)

            flash(gettext("File '%(filename)s' successfully uploaded",
                          filename=file.filename))

        else:
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
                                       secure_filename('interrogacion.png'))
    else:
        abort(404)

@APP.route('/_save_json_in_my_folder', methods=["POST"])
def save_json():
    """
    Save the json in a folder.

    :returns: A response with the json.
    :rtype: flask.Response

    """
    json_data = request.get_json()
    my_json = json.loads(json_data['json'])
    filename = json_data['filename']
    exercise = json_data['exercise']

    #If file exists we remove it and the we create the new one
    if os.path.exists(os.path.join(APP.config['EXERCISE_FOLDER'],secure_filename(filename.split(".")[0]), secure_filename(exercise), secure_filename('savedPoints.json'))):
        os.remove(os.path.join(APP.config['EXERCISE_FOLDER'],secure_filename(filename.split(".")[0]), secure_filename(exercise), secure_filename('savedPoints.json')))

    file = open(os.path.join(APP.config['EXERCISE_FOLDER'],secure_filename(filename.split(".")[0]), secure_filename(exercise), secure_filename('savedPoints.json')), 'w')
    json.dump(my_json, file)
    file.close()

    return jsonify(my_json)


@APP.route('/_modify_filename', methods=["POST"])
def modify_name():
    """
    Modify exercise name.

    :returns: A response with the json.
    :rtype: flask.Response

    """
    json_data = request.get_json()
    newExerciseName = json_data['name']
    prevName = json_data['prevName']

    #If file exists we remove it and the we create the new one
    if os.path.exists(os.path.join(APP.config['EXERCISE_FOLDER'],secure_filename(json_data["filename"].split(".")[0]), secure_filename(prevName))):
        os.rename(os.path.join(APP.config['EXERCISE_FOLDER'],secure_filename(json_data["filename"].split(".")[0]), secure_filename(prevName)),os.path.join(APP.config['EXERCISE_FOLDER'],secure_filename(json_data["filename"].split(".")[0]), secure_filename(newExerciseName)))

    return jsonify(json_data)


@APP.route('/_load_json_in_visor', methods=["POST"])
def load_json():
    """
    Loads the json into the visor.

    :returns: A response with the json.
    :rtype: flask.Response

    """
    json_data = request.get_json()
    exercise = json_data['exercise']
    filename = json_data['filename']

    path = os.path.join(APP.config['EXERCISE_FOLDER'],secure_filename(filename.split(".")[0]), secure_filename(exercise), secure_filename('savedPoints.json'))

    if os.path.exists(path):
        new_json = json.load(open(path))
        return jsonify(new_json)
    else:
        return jsonify({"annotations":[],"filename":filename,"measurements":[]})


@APP.route('/_cancel_started_exercise', methods=["POST"])
def cancel_exercise():
    """
    """
    json_data = request.get_json()
    exercise = json_data['exercise']
    filename = json_data['filename']

    path = os.path.join(APP.config['EXERCISE_FOLDER'],secure_filename(filename.split(".")[0]), secure_filename(exercise))

    if not os.path.exists(os.path.join(path, secure_filename('savedPoints.json'))):
        shutil.rmtree(path)

    return jsonify(json_data)



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
