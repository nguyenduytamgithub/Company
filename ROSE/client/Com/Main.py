# pip install requests

from Connection import Com
from Serial import Serial
from CheckSumFactory import CheckSumFactory
from hashlib import sha256

# scheck = CheckSumFactory().create("ABC DEF")
# print scheck
# if CheckSumFactory().verify("ABC 1", scheck):
#     print "Correct"
# else:
#     print "Wrong"

# print sha256("light_0:10.50 ").hexdigest()

com = Com()
while 1:
    data = Serial().requestData("get")
    print data
    # response = com.sendData(data)
