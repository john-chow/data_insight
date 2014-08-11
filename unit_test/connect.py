import sys
sys.path.append('/home/zzr/eclipse_workspace/MyTableau/')
print sys.path


import unittest
from connect.views import *
from common.head import ConnNamedtuple

print dir()


class ConnectTestCase(unittest.TestCase):
    def setUp(self):
        pass

    def tearDown(self):
        pass

    def testConnectDb(self):
        ip, port, db, user, pwd, kind \
            = '10.1.50.125', '5432', 'data_insight', 'postgres', '123456', 'postgres' 
        conn_nt = ConnNamedtuple(ip, port, db, user, pwd, kind)
        succ = connectDb(conn_nt)[0]
        self.assertEqual(succ, True)



if '__main__' == __name__:
    suite = unittest.TestSuite()
    suite.addTest(ConnectTestCase('testConnectDb'))

    runner = unittest.TextTestRunner()
    runner.run(suite)

