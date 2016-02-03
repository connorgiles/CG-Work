# -*- coding: utf-8 -*-

from uuid import getnode as get_mac

#-------------------------------------------------------------------------------

def getUUID():
	mac = get_mac()
	return ':'.join(("%012X" % mac)[i:i+2] for i in range(0, 12, 2))

#-------------------------------------------------------------------------------

# Internal message to convert hex string to array
def hexToArray(string):
	return [string[i:i+2] for i in range(0,len(string), 2)]

#-------------------------------------------------------------------------------

def concatInnerArray(array):
	retvalue = []
	for i in range(0,len(array)):
		retvalue.append(''.join(array[i]))

#-------------------------------------------------------------------------------

def ByteToHex( byteStr ):
    """
    Convert a byte string to it's hex string representation e.g. for output.
    """
    
    # Uses list comprehension which is a fractionally faster implementation than
    # the alternative, more readable, implementation below
    #   
    #    hex = []
    #    for aChar in byteStr:
    #        hex.append( "%02X " % ord( aChar ) )
    #
    #    return ''.join( hex ).strip()        

    return ''.join( [ "%02X " % ord( x ) for x in byteStr ] ).strip()

#-------------------------------------------------------------------------------

def HexToByte( hexStr ):
    """
    Convert a string hex byte values into a byte string. The Hex Byte values may
    or may not be space separated.
    """
    # The list comprehension implementation is fractionally slower in this case    
    #
    #    hexStr = ''.join( hexStr.split(" ") )
    #    return ''.join( ["%c" % chr( int ( hexStr[i:i+2],16 ) ) \
    #                                   for i in range(0, len( hexStr ), 2) ] )
 
    bytes = []

    hexStr = ''.join( hexStr.split(" ") )

    for i in range(0, len(hexStr), 2):
        bytes.append( chr( int (hexStr[i:i+2], 16 ) ) )

    return ''.join( bytes )

#-------------------------------------------------------------------------------
