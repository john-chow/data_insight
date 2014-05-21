# -*- coding: utf-8 -*-

from django.db import models
from MyTableau.models import ElementModel
# Create your models here.

class WidgetModel(ElementModel):
    """
    场景类，继承ElementModel
    """
    m_ip    = models.IPAddressField()
    m_port  = models.IntegerField()
    m_db    = models.CharField(max_length = 20)
    m_table   = models.CharField(max_length=50)               
    m_x = models.CharField(max_length=50)               
    m_y = models.CharField(max_length=50)               
    m_size = models.CharField(max_length=20)               
    m_color = models.CharField(max_length=20)               
    m_graph = models.CharField(max_length=20)               

    class Meta:
        db_table = 'widgets'

class UsedDb(models.Model):
    """
    数据库连接类
    """
    ip          = models.IPAddressField(max_length=20)
    port        = models.IntegerField()
    tablename   = models.CharField(max_length=20)
    username    = models.CharField(max_length=20)
    pwd         = models.CharField(max_length=20)

    class Meta:
        db_table = 'useddb'
