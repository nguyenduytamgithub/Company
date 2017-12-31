import requests
import json
from DesignPattern import Singleton


class Com:
    __metaclass__ = Singleton

    def __init__(self):
        with open('config.json') as config_file:
            config = json.load(config_file)
        self.serverUrl = config["serverUrl"]

    def sendData(self, data):
        try:
            r = requests.post(self.serverUrl, json=data, verify=False)
            return r.text
        except:
            return ""
