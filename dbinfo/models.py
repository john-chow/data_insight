# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#     * Rearrange models' order
#     * Make sure each model has one field with primary_key=True
# Feel free to rename the models, but don't rename db_table values or field names.
#
# Also note: You'll have to insert the output of 'django-admin.py sqlcustom [appname]'
# into your database.
from __future__ import unicode_literals

from django.db import models
from common.tool import cvtDateTimeToStr
from datetime import datetime

class ElementModel(models.Model):
	ele_id = models.CharField(max_length=255)
	name = models.CharField(max_length=20)
	type = models.IntegerField()
	owner = models.CharField(max_length=20)
	create_time = models.DateTimeField()
	is_distributed = models.BooleanField()

	def __init__(self, user, name=u''):
		now = datetime.now()
		self.create_time = now
		self.name = name
		self.owner = user
		self.id = str(self.type) + '_' + self.owner + '_' + cvtDateTimeToStr(now)

	class Meta:
		abstract = True



class SubjectModel(ElementModel):
	switch_effect = models.CharField(max_length=255)
	scens_list = models.ManyToManyField('SceneModel')

	def __init__(self, user, name=u''):
		self.type = 0
		ElementModel.__init__(self, name)

	def getScnsList(self):
		pass

	def addScn(self, scn_id):
		pass

	def rmScn(self, scn_id):
		pass
	


class SceneModel(ElementModel):
	layout = models.CharField(max_length=50)
	wis_list = models.ManyToManyField('WidgetModel')

	def __init__(self, user, name=u''):
		self.type = 0
		ElementModel.__init__(self, name)

	def getWisList(self):
		pass

	def addWi(self, wi_id):
		pass

	def rmWi(self, wi_id):
		pass


class WidgetModel(ElementModel):
	draw_args = models.CharField(max_length=255)

	def __init__(self, user, name=u''):
		self.type = 0
		ElementModel.__init__(self, name)



"""
class Relation(models.Model):
	type = models.IntegerField()
	sub_id = models.CharField(max_length=255)
	scn_id = models.CharField(max_length=255)
	wi_id  = models.CharField(max_length=255)
	scn_order = models.IntegerField()
	wi_order = models.IntegerField()

	def getSubsList(**args):
		pass

	def getScnsList(**args):
		pass

	def getWisList(**args):
		pass
"""







