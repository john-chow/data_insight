# -*- coding: utf-8 -*-

from django.db import models
from scene.models import SceneModel
from MyTableau.models import ElementModel

# Create your models here.
class ThemeModel(ElementModel):
	"""
	场景类，继承ElementModel
	"""
	m_switch_effect = models.CharField(max_length=255)
	description = models.TextField(max_length=255)
	m_scenes = models.ManyToManyField(SceneModel\
						, through='TheToScnRelationModel'\
						)

	class Meta:
		db_table = 'themes'

class TheToScnRelationModel(models.Model):
	"""
	场景和主题关系类
	"""
	m_sub = models.ForeignKey(ThemeModel, related_name = 't2r_set')
	m_scn = models.ForeignKey(SceneModel, related_name = 'sences_set')
	m_order = models.IntegerField()

	class Meta:
		db_table = 'theme_to_scene'