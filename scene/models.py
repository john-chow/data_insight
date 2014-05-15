# -*- coding: utf-8 -*-

from django.db import models
from widget.models import WidgetModel
from MyTableau.models import ElementModel

# Create your models here.
class SceneModel(ElementModel):
	"""
	场景类，继承ElementModel
	"""
	m_layout = models.CharField(max_length=50)
	m_widgets = models.ManyToManyField(WidgetModel \
							, through='ScnToWiRelationModel')

	class Meta:
		db_table = 'scenes'

class ScnToWiRelationModel(models.Model):
	"""
	场景与组件的关系类
	"""
	m_scn = models.ForeignKey(SceneModel)
	m_wi = models.ForeignKey(WidgetModel)
	m_order = models.IntegerField()

	class Meta:
		db_table = 'scene_to_widget'