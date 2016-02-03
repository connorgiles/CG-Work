# -*- coding: utf-8 -*-

import time
from cottonwood import *
from connection import *
from util import *
import sys
import os
import requests
import json

def main():
	server = # Server IP
	port = 8080
	uuid = getUUID()
	# Get reader ID based off MAC address
	r = requests.post("http://"+server+":"+str(port)+"/api/v1/reader/login", json = {"uuid":uuid})
	readerID = r.json()['_id']

	# If no reader is found, register one
	if readerID is None:
		r = requests.post("http://"+server+":"+str(port)+"/api/v1/reader", json = {"name": "New Reader", "uuid":uuid})
		readerID = r.json()['_id']

	# Initiate Cottonwood and Socket connnections
	socket = Socket(server, port, headers={'id': readerID})
	cottonwood = Cottonwood()
	# Setup Cottonwood
	cottonwood.turnOnAntenna()
	cottonwood.configureUSFrequency()
	# Send status update to server
	socket.statusUpdate('Reading')
	# Start Cottonwood Read
	try:
		while 1:
			initiate_time = time.time()*1000
			result = cottonwood.performInventoryScan()
			if len(result) != 0:
				print 'Found '+str(len(result))+' tags'
			else:
				print 'Reading...' 
			package = {
				'initiate_time': initiate_time,
				'created_date': time.time()*1000,
				'tags': result
			}
			socket.tagReading(package)
	except KeyboardInterrupt:
		# Turn off Cottonwood
		cottonwood.turnOffAntenna()
		print '\nGood Bye!'
		# Exit System
		try:
			sys.exit(0)
		except SystemExit:
			os._exit(0)

if __name__ == '__main__':
	# Start Program
	main()