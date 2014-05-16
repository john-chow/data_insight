#!/usr/bin/env python
#
# Unit tests for Widgets. Some of these tests intentionally fail.
# 
# $Id: widgettests.py,v 1.8 2001/08/06 09:10:00 purcell Exp $

from widget.models import WidgetModel as Widget

import unittest

class WidgetTestCase(unittest.TestCase):
    def setUp(self):
        self.widget = Widget()
    def tearDown(self):
        self.widget.dispose()
        self.widget = None
    def testDefaultSize(self):
        pass
    def testResize(self):
        pass

# Fancy way to build a suite
class WidgetTestSuite(unittest.TestSuite):
    def __init__(self):
        unittest.TestSuite.__init__(self,map(WidgetTestCase,
                                             ("testDefaultSize",
                                              "testResize")))

# Simpler way
def makeWidgetTestSuite():
    suite = unittest.TestSuite()
    suite.addTest(WidgetTestCase("testDefaultSize"))
    suite.addTest(WidgetTestCase("testResize"))
    return suite

def suite():
    return unittest.makeSuite(WidgetTestCase)

# Make this test module runnable from the command prompt
if __name__ == "__main__":
    #unittest.main(defaultTest="WidgetTestCase:testResize")
    unittest.main()

# def test():
#     pass
#     """
#     suite = Suite()
#     runner = unittest.TextTestRunner()
#     runner.run(suite)
#     """

# def Suite():
#     def __init__():
#         unittest.TestSuite.__init__(
#             self.map(Case, (

#             ))
#         )



# def Case():
#     def setUp():
#         pass

#     def tearDown():
#         pass
