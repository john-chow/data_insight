# -*- coding: utf-8 -*-
import ast
from datetime import datetime

from django.conf import settings
from django.db import models
from widget.factor import FactorFactory
from widget.models import ExternalDbModel

import pdb

# Create your models here.
class EventModel(models.Model):
    m_name            = models.CharField(max_length = 20, db_column = 'name')
    m_table           = models.CharField(max_length = 20, db_column = 'table')
    m_left_factor     = models.CharField(max_length = 200, db_column = 'object')
    m_operator        = models.CharField(max_length = 10, db_column = 'operator')
    m_right_factor    = models.CharField(max_length = 200, db_column = 'threshold')
    m_alarm_kind      = models.IntegerField(db_column = 'alarm')
    m_creator         = models.ForeignKey(settings.AUTH_USER_MODEL)
    m_conn_db         = models.ForeignKey(ExternalDbModel)

    def getFactors(self):
        return self.m_left_factor, self.m_right_factor

    def update(self, **kwargs):
        '''
        更新对象里面的orm元素信息
        '''
        for key, value in kwargs.items():
            setattr(self, key, value) if hasattr(self, key) else None

    class Meta:
        db_table = 'event'


class WarningModel(models.Model):
    m_result        = models.CharField(max_length = 20, db_column = 'result')
    m_if_notify     = models.BooleanField(default = False, db_column = 'ifnotify')
    m_event         = models.ForeignKey(EventModel, db_column = 'event_id') 

    class Meta:
        db_table = 'warning'


