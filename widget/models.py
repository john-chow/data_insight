# -*- coding: utf-8 -*-

from django.db import models
from MyTableau.models import ElementModel
# Create your models here.

class WidgetModel(ElementModel):
	"""
	场景类，继承ElementModel
	"""
	m_draw_args = models.CharField(max_length=255)

	class Meta:
		db_table = 'widgets'

class UsedDb(models.Model):
	"""
	数据库连接类
	"""
	ip 			= models.IPAddressField(max_length=20)
	port 		= models.IntegerField()
	tablename	= models.CharField(max_length=20)
	username 	= models.CharField(max_length=20)
	pwd			= models.CharField(max_length=20)

	class Meta:
		db_table = 'useddb'