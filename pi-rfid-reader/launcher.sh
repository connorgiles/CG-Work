#!/bin/sh
# launcher.sh
# navigate to home directory, then to this directory, then execute python script, then back home

sleep 10
cd /
cd home/pi/rfid-py
sudo python main.py
cd /