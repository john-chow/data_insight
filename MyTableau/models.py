# -*- coding: utf-8 -*-

# Create your models here.
from django.db import models
from django.utils import simplejson as json
from skin.models import SkinModel

class ElementModel(models.Model):
    """
    组件，场景，主题的基类
    """
    m_name = models.CharField(max_length=20, db_column='name', null=True)
    m_owner = models.CharField(max_length=20, db_column='owner')
    m_create_time = models.DateTimeField(auto_now_add=True, db_column='create_time')
    m_is_distributed = models.BooleanField(default=False, db_column='is_distributed')
    m_status = models.BooleanField(default=True, db_column='status')

    class Meta:
        abstract = True



