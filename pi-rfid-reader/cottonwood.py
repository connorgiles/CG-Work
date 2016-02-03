# -*- coding: utf-8 -*-

import serial
from util import *
from exceptions import *

CMD_TURN_ON_ANTENNA = '\x18\x03\xFF'
CMD_TURN_OFF_ANTENNA = '\x18\x03\x00'
CMD_SET_US_FREQUENCY = '\x41\x08\x08\x12\x26\x0e\xd8\x01'
CMD_INVENTORY_SCAN = '\x43\x03\x01'
CMD_SELECT_TAG_BASE = '\x33\x0F\x0C'
CMD_SET_EPC_PASS_BASE = '\x35\x0D\x00\x02'
CMD_TAG_WRITE_BASE = '\x35\x15\x01\x02'

# internal encapsulation of the response read from the Cottonwood
# after issuing a command
class RfidReaderResult(object):
	def __init__(self):
		self.__is_successful = False
		self.__result = None
	@property
	def isSuccessful(self):
		return self.__is_successful
	@isSuccessful.setter
	def isSuccessful(self, isSuccessful):
		self.__is_successful = isSuccessful
	@property
	def result(self):
		return self.__result
	@result.setter
	def result(self, result):
		self.__result = result

class Cottonwood(object):

	_rfid_reader = None

	# Constructor configures the Serial settings for interfacing
	# with the Cottonwood board1
	def __init__(self):
		self._rfid_reader = serial.Serial(
			port='/dev/ttyAMA0',
			baudrate = 9600,
			parity=serial.PARITY_NONE,
			stopbits=serial.STOPBITS_ONE,
			bytesize=serial.EIGHTBITS,
			timeout=1
		)

	# Turns on antenna
	def turnOnAntenna(self):
		return self.antennaPower(CMD_TURN_ON_ANTENNA)

	# Turns off antenna
	def turnOffAntenna(self):
		return self.antennaPower(CMD_TURN_OFF_ANTENNA)

	def configureUSFrequency(self):
		retvalue = False
		result = self.sendCommand(CMD_SET_US_FREQUENCY)
		if result is not None:
			if len(result) > 3 and result[0] == '34' and result[1] == '40' and result[2] == 'FE' and result[3] == 'FF':
				retvalue = True
		return retvalue

	# Performs an inventory scan
	def performInventoryScan(self):
		retvalue = []
		result = self.sendCommand(CMD_INVENTORY_SCAN)
		if result is not None:
			if len(result) > 3 and result[0] == '44':
				numTags = result[2]
				if numTags > 0:
					arrayIdx = 0
					for i in range(0, int(numTags,16)):
						arrayIdx = arrayIdx + 10
						tag = []
						for j in range(0,12):
							tag.append(result[arrayIdx])
							arrayIdx = arrayIdx + 1
						retvalue.append(''.join(tag).upper())
		return retvalue

	# Select a tag
	def selectTag(self, tag_epc):
		retvalue = RfidReaderResult()
		command = CMD_SELECT_TAG_BASE + HexToByte(tag_epc)
		result = self.sendCommand(command)
		retvalue.result = result
		if result is not None:
			if len(result) == 3 and result[0] == '34' and result[1] == '03' and result[2] == '00':
				retvalue.isSuccessful = True
		return retvalue

	# Select a tag
	def setEPCPassword(self, original_password, new_password):
		retvalue = RfidReaderResult()
		command = CMD_TAG_WRITE_BASE + HexToByte(original_password) + '\02' + HexToByte(new_password)
		result = self.sendCommand(command)
		retvalue.result = result
		if result is not None:
			if len(result) == 4 and result[0] == '36' and result[1] == '04' and result[2] == '00' and result[3] == '02':
				retvalue.isSuccessful = True
		return retvalue

	# Select a tag
	def writeToTag(self, tag_epc, tag_pass='00000000'):
		retvalue = RfidReaderResult()
		command = CMD_TAG_WRITE_BASE + HexToByte(tag_pass) + '\06' + HexToByte(tag_epc)
		result = self.sendCommand(command)
		retvalue.result = result
		if result is not None:
			if len(result) == 4 and result[0] == '36' and result[1] == '04' and result[2] == '00' and result[3] == '06':
				retvalue.isSuccessful = True
		return retvalue

	# A method that sends antenna commands and parses the
	# expected response from the Cottonwood
	def antennaPower(self, command):
		retvalue = False
		result = self.sendCommand(command)
		if result is not None:
			if len(result) == 3 and result[0] == '19' and result[0] == '03' and result[0] == '00':
				retvalue = True
		return retvalue

	# Serially writes a command byte array to the Cottonwood board
	def sendCommand(self, command):
		retvalue = None
		# send comand to the Cottonwood
		write_result = self.write(command)
		if write_result.isSuccessful:
			# get response from the cottonwood
			read_result = self.read()
			if read_result.isSuccessful:
				retvalue = read_result.result
			else:
				# Throw Error
				raise Exception('Reader did not respond')
		else:
			# Throw Error
			raise Exception('Could not write to the reader')
		return retvalue

    # Serial read from the Cottonwood
	def read(self):
		retvalue = RfidReaderResult()
		try:
			retvalue.result = hexToArray(self._rfid_reader.readline().encode('hex'))
			retvalue.isSuccessful = True
		except Exception as ex:
			retvalue.isSuccessful = False
			raise ex
		return retvalue

	# Serial write function to the Cottonwood
	def write(self, write_bytes):
		retvalue = RfidReaderResult()
		try:
			self._rfid_reader.write(write_bytes)
			retvalue.result = write_bytes
			retvalue.isSuccessful = True
		except Exception as ex:
			retvalue.isSuccessful = False
			raise ex
		return retvalue




