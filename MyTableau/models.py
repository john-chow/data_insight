# -*- coding: utf-8 -*-

# Create your models here.
from django.db import models

class ElementModel(models.Model):
	"""
	组件，场景，主题的基类
	"""
	m_id = models.IntegerField(primary_key=True)
	m_name = models.CharField(max_length=20, null=True)
	m_owner = models.CharField(max_length=20)
	m_create_time = models.DateTimeField()
	m_is_distributed = models.BooleanField()

	class Meta:
		abstract = True