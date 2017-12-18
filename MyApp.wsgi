import sys
import os
sys.path.append(os.path.abspath('/var/www/3D-Viewer-v2.0'))

activate_this = '/var/www/3D-Viewer-v2.0/mi_venv/bin/activate_this.py'
with open(activate_this) as file:
    exec(file.read(), dict(__file__=activate_this))

path = os.path.join(os.path.dirname(__file__), os.pardir)
if path not in sys.path:
    sys.path.append(path)

from MyApp import APP as application

if __name__ == '__main__':
    APP.run()