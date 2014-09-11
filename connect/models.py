# -*- coding: utf-8 -*-
from django.db import models
from django.contrib.auth.models import User
from django.utils import simplejson as json
from widget.models import ExternalDbModel

# Create your models here.
class FieldsInfoModel(models.Model):
    m_user = models.ForeignKey(User, db_column = 'user')
    m_conn = models.ForeignKey(ExternalDbModel, db_column = 'conn')
    m_table = models.CharField(max_length = 100, db_column = 'table')
    m_nicknames = models.CharField(max_length = 300, db_column = 'nicknames')
    m_types = models.CharField(max_length = 300, db_column = 'types')

    def getTypesDict(self):
        """
        获取类型映射表
        """
        return json.loads(self.m_types)

    def getNicknamesDict(self):
        """
        获取备注名映射表
        """
        return json.loads(self.m_nicknames)

    class meta:
        db_table = 'fields_info'

