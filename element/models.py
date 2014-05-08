# -*- coding: utf-8 -*-

# Create your models here.
from django.db import models

class ElementModel(models.Model):
	m_id = models.IntegerField(primary_key=True)
	m_name = models.CharField(max_length=20, null=True)
	m_owner = models.CharField(max_length=20)
	m_create_time = models.DateTimeField()
	m_is_distributed = models.BooleanField()

	class Meta:
		abstract = True



class SubjectModel(ElementModel):
	m_switch_effect = models.CharField(max_length=255)
	m_scenes = models.ManyToManyField('SceneModel' \
						, through='SubToScnRelationModel')

	class Meta:
		db_table = 'subjects'
	


class SceneModel(ElementModel):
	m_layout = models.CharField(max_length=50)
	m_widgets = models.ManyToManyField('WidgetModel' \
							, through='ScnToWiRelationModel')

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



class ScnToWiRelationModel(models.Model):
	m_scn = models.ForeignKey('SceneModel')
	m_wi = models.ForeignKey('WidgetModel')
	m_order = models.IntegerField()

	class Meta:
		db_table = 'scene_to_widget'




