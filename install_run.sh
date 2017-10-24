#!/bin/bash
python3 -m venv mi_venv
source mi_venv/bin/activate
pip3 install -r requirements.txt
sudo apt-get install libhdf5-serial-dev
python3 runserver.py
