# -*- encoding: utf-8 -*-

import unittest
import sys, os

FILE_PATH = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT_PATH = os.path.abspath(os.path.join(FILE_PATH, os.pardir, os.pardir))
sys.path.append(PROJECT_ROOT_PATH)

os.environ['DJANGO_SETTINGS_MODULE'] = 'MyTableau.settings'
from dbinfo.models import *


User = u'xxx'


def testSuit():
	class SubjectSuite(unittest.TestSuite):
		def __init__():
			unittest.TestSuite.__init__(
				self, map(SubjectModelTestCase, (
					'testInit', 'testGetScnsList', 'testAddScn', 'testRmScn'
				))
			)

	class WidgetSuite(unittest.TestSuite):
		def __init():
			unittest.TestSuite.__init__(
				self, map(SubjectModelTestCase, (
					'testInit'
				))
			)

	subSuite 	= SubjectSuite()
	wiSuite 	= WidgetSuite()
	allSuites 	= unittest.TestSuite((subSuite, allSuites))

	return allSuites



class SubjectModelTestCase(unittest.TestCase):
	def setUp(self):
		global User
		self.scns_num = 5
		self.sub_model = SubjectModel(user=User)
		for i in range(self.scns_num):
			scnModel = SceneModel(user=User)
			self.sub_model.scens_list.add(scnModel)

	def tearDown(self):
		self.sub_model.dispose()
		self.sub_model = None

	def testInit(self):
		self.assertEqual(self.owner, u'xxx')
		self.assertIn(u'2014', self.create_time.format('%s'))

	def testGetScnsList(self):
		scns_length = len(self.sub_model.getScnList())
		self.assertEqual(scns_length, self.scns_num)

	def testAddScn(self):
		self.sub_model.addScn(self, u'123456789')
		scns_length = len(self.sub_model.scens_list)
		self.assertEqual(scns_length, self.scns_num + 1)

	def testRmScn(self):
		pass



class SceneModelTestCase(unittest.TestCase):
	""" 和上面差不多 """
	pass


class WidgetModelTestCase(unittest.TestCase):
	def setUp(self):
		global User
		self.wi_model = WidgetModel(user=User)

	def tearDown(self):
		self.wi_model.dispose()
		self.wi_model = None

	def testInit(self):
		self.assertEqual(self.owner, u'xxx')
		self.assertIn(u'2014', self.create_time.format('%s'))




