#!/bin/bash
python3 -m venv mi_venv
source mi_venv/bin/activate
pip3 install -r requirements.txt
workers=$((2*$(nproc)+1))
gunicorn -w $workers -b arquimedes.ubu.es/visor3d MyApp:APP