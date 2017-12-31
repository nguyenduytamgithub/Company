import commands
import serial
from DesignPattern import Singleton
from hashlib import sha256

class Serial:
    __metaclass__ = Singleton

    def __init__(self):
        self.__waitForSerial()

    def __waitForSerial(self):
        while (1):
            result = commands.getstatusoutput('ls /dev/ttyUSB*')
            if (result[0] == 0):
                print result[1]
                self.__serial = serial.Serial(result[1], 115200, timeout=10)
                break

            result = commands.getstatusoutput('ls /dev/ttyACM*')
            if (result[0] == 0):
                print result[1]
                self.__serial = serial.Serial(result[1], 115200, timeout=10)
                break

    def __processData(self, data):
        data = data.replace('\r\n', '')
        try:
            length = len('checksum')
            idx = data.index('checksum') + length
            checksum = data[idx + 1:]
            data = data[:idx - length]
            if sha256(data).hexdigest() != checksum:
                return ''
            data = data.strip().split(' ')
            val = {}
            for d in data:
                x = d.split(':')
                val[x[0].strip()] = x[1].strip()
        except:
            return ''

        return val

    def requestData(self, cmd):
        cmd += "\r\n"
        self.__serial.write(cmd)
        while (1):
            data = self.__serial.readline()
            if data:
                val = self.__processData(data)
                if (len(val) > 0): return val
            self.__serial.write(cmd)
