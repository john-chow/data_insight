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
	m_id = models.CharField(max_length=255)
	m_name = models.CharField(max_length=20)
	m_owner = models.CharField(max_length=20)
	m_create_time = models.DateTimeField()
	m_is_distributed = models.BooleanField()

	class Meta:
		abstract = True



class SubjectModel(ElementModel):
	m_switch_effect = models.CharField(max_length=255)
	m_relation_to_scn = models.ManyToManyField('SceneModel' \
						, through='SubToScnRelationModel')

	class Meta:
		db_table = 'subjects'
	


class SceneModel(ElementModel):
	m_layout = models.CharField(max_length=50)
	m_relation_to_wi = models.ManyToManyField('WidgetModel' \
							, through='ScnToWiRelationModel')

	def getWisList(self):
		pass

	def addWi(self, wi_id):
		pass

	def rmWi(self, wi_id):
		pass

	class Meta:
		db_table = 'scenes'


class WidgetModel(ElementModel):
	m_draw_args = models.CharField(max_length=255)

	class Meta:
		db_table = 'widgets'



class SubToScnRelationModel(models.Model):
	m_sub = models.ForeignKey('SubjectModel')
	m_scn = models.ForeignKey('SceneModel')
	m_order = models.IntegerField()

	class Meta:
		db_table = 'subject_to_scene'
		ordering = ['m_sub', 'm_order']


class ScnToWiRelationModel(models.Model):
	m_scn = models.ForeignKey('SceneModel')
	m_wi = models.ForeignKey('WidgetModel')
	m_order = models.IntegerField()

	class Meta:
		db_table = 'scene_to_widget'
		ordering = ['m_scn', 'm_order']







