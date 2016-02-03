# -*- coding: utf-8 -*-
# 
import time
from socketIO_client import SocketIO, BaseNamespace
import json
from codes import *

class ReaderNamespace(BaseNamespace):
	def on_connect(self):
		print('[Connected]')
	def on_reconnect(self):
		print('[Reconnected]')
		self.emit('status update', 'Reading')
	def on_echo(self, *args):
		msg = args[0]
		# Check Echo response
		result = EchoStatusCode.checkMessage(msg['status'])
		if result.isSuccessful:
			print result.result
		else:
			# Raise Error
			raise Exception(result.result)
	def on_disconnect(self):
		print('[Disconnected]')

class Socket(object):
	def __init__(self, url, port, headers):
		self.socketIO = SocketIO(url, port, headers=headers)
		self.reader_namespace = self.socketIO.define(ReaderNamespace, '/readers')

	def statusUpdate(self, message):
		print message
		self.socketIO.wait(seconds=0.1)
		self.reader_namespace.emit('status update', message)

	def tagReading(self, package):
		self.reader_namespace.emit('tag reading', json.dumps(package))
		self.socketIO.wait(seconds=0.1)