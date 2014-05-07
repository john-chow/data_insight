# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#     * Rearrange models' order
#     * Make sure each model has one field with primary_key=True
# Feel free to rename the models, but don't rename db_table values or field names.
#
# Also note: You'll have to insert the output of 'django-admin.py sqlcustom [appname]'
# into your database.

# -*- coding: utf-8 -*-

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

	class Meta:
		abstract = True



class SubjectModel(ElementModel):
	switch_effect = models.CharField(max_length=255)
	scens_list = models.ManyToManyField('SceneModel' \
						, through='SubToScnRelationModel')

	def getScnsList(self):
		return list(self.scens_list)

	def addScn(self, scn_id):
		scnModel = SceneModel.object.filter(ele_id = scn_id)
		self.scens_list.add(scnModel)
		self.save()
		

	def rmScn(self, scn_id):
		scnModel = SceneModel.object.filter(ele_id = scn_id)
		self.scens_list.remove(scnModel)
		self.save()
	


class SceneModel(ElementModel):
	layout = models.CharField(max_length=50)
	wis_list = models.ManyToManyField('WidgetModel' \
							, through='ScnToWiRelationModel')

	def getWisList(self):
		pass

	def addWi(self, wi_id):
		pass

	def rmWi(self, wi_id):
		pass


class WidgetModel(ElementModel):
	draw_args = models.CharField(max_length=255)



class SubToScnRelationModel(models.Model):
	sub = models.ForeignKey('SubjectModel')
	scn = models.ForeignKey('SceneModel')
	order = models.IntegerFiled()

	class Meta:
		db_table = 'subject_to_scene'
		order = ['sub', 'order']


class ScnToWiRelationModel(models.Model):
	scn = models.OneToOneField('SceneModel')
	wi = models.OneToOneField('WidgetModel')
	order = models.IntegerFiled()

	class Meta:
		db_table = 'scene_to_widget'
		order = ['scn', 'order']




