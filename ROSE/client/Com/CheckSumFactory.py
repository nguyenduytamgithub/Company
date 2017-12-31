from DesignPattern import Singleton

class CheckSumFactory:
    __metaclass__ = Singleton

    def create(self, str):
        return ~sum(bytearray(str))

    def verify(self, str, scheck):
        return ~(sum(bytearray(str)) + scheck) == 0
