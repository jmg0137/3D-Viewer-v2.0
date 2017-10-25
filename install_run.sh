#!/bin/bash
python3 -m venv mi_venv
source mi_venv/bin/activate
pip3 install -r requirements.txt
python3 runserver.py
