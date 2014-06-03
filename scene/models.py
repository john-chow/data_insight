# -*- coding: utf-8 -*-

from django.db import models
from widget.models import WidgetModel
from MyTableau.models import ElementModel

# Create your models here.
class SceneModel(ElementModel):
    """
    场景类，继承ElementModel
    """
    m_layout        = models.TextField()
    m_insert_word   = models.TextField()
    m_insert_pic    = models.TextField()
    m_snapshot      = models.TextField()
    m_widgets       = models.ManyToManyField(WidgetModel \
                            , through='ScnToWiRelationModel' \
                            , related_name = 's2w_set')

    class Meta:
        db_table = 'scenes'

class ScnToWiRelationModel(models.Model):
    """
    场景与组件的关系类
    """
    m_scn = models.ForeignKey(SceneModel, related_name = 's2r_set')
    m_wi = models.ForeignKey(WidgetModel, related_name = 'w2r_set')
    m_stamp = models.BigIntegerField()

    class Meta:
        db_table = 'scene_to_widget'
