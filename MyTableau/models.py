# -*- coding: utf-8 -*-

# Create your models here.
from django.db import models

class ElementModel(models.Model):
	"""
	组件，场景，主题的基类
	"""
	m_name = models.CharField(max_length=20, null=True)
	m_owner = models.CharField(max_length=20)
	m_create_time = models.DateTimeField(auto_now_add=True)
	m_is_distributed = models.BooleanField(default=False)
	m_status = models.BooleanField(default=True)

	class Meta:
		abstract = True
