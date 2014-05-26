# -*- coding: utf-8 -*-

from django.db import models
from MyTableau.models import ElementModel
# Create your models here.

class WidgetModel(ElementModel):
    """
    场景类，继承ElementModel
    """
    m_table         = models.CharField(max_length=50)               
    m_x             = models.CharField(max_length=50)               
    m_y             = models.CharField(max_length=50)               
    m_size          = models.CharField(max_length=20)               
    m_color         = models.CharField(max_length=20)               
    m_graph         = models.CharField(max_length=20)               
    m_pic           = models.TextField()
    m_external_db   = models.ForeignKey('ExternalDbModel')

    class Meta:
        db_table = 'widgets'

class ExternalDbModel(models.Model):
    """
    数据库连接类
    """
    m_ip            = models.IPAddressField(max_length=20)
    m_port          = models.IntegerField(default=5432)
    m_user          = models.CharField(max_length=20)
    m_pwd           = models.CharField(max_length=20)
    m_db            = models.CharField(max_length=20)

    def getConnTuple(self):
        return (self.m_ip, self.m_port, self.m_db, self.m_user, self.m_pwd)

    class Meta:
        db_table = 'externaldb'
