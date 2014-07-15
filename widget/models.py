# -*- coding: utf-8 -*-

from django.db import models
from django.utils import simplejson as json

from MyTableau.models import ElementModel
from common.head import WIDGET_SKIN_PATH, SKIN_FILE_TYPE
from common.tool import readJsonFile

import pdb
# Create your models here.

class WidgetModel(ElementModel):
    """
    场景类，继承ElementModel
    """
    m_table         = models.CharField(max_length=50, db_column='table')               

    # 影响图形本身效果
    m_x             = models.CharField(max_length=1024, db_column='x')               
    m_y             = models.CharField(max_length=1024, db_column='y')               
    m_size          = models.CharField(max_length=50, db_column='size')               
    m_color         = models.CharField(max_length=50, db_column='color')               
    GRAPH_CHOICES   = (
        ('bar',         'bar')
        , ('s_bar',     'stack_bar')
        , ('line',      'line')
        , ('s_line',    'stack_line')
        , ('area',      'area')
        , ('s_area',    's_area')
        , ('scatr',     'scatter')
        , ('radar',     'radar')
        , ('map',       'map')
    )
    m_graph         = models.CharField(max_length = 16, choices = GRAPH_CHOICES, \
                                        db_column='graph')               
    m_if_update     = models.BooleanField(db_column = 'ifupdate', default = False)
    m_update_period = models.IntegerField(db_column = 'period', default = 0)
    m_pic           = models.TextField(db_column='snapshot')
    m_external_db   = models.ForeignKey('ExternalDbModel')


    def restoreReqDataDict(self):
        return { 
            u'x': eval(self.m_x) if self.m_x else self.m_x \
            , u'y': eval(self.m_y) if self.m_y else self.m_y \
            , u'tables':    json.loads(self.m_table) \
            , u'color':     eval(self.m_color) if self.m_color else self.m_color \
            , u'size':      self.m_size \
            , u'graph':     self.m_graph \
            , u'table':     self.m_table \
        }

    def hasAggreate(self):
        '''
        判断本组件是否存在存在聚合运算
        '''
        x_list = eval(self.m_x) if self.m_x else self.m_x 
        y_list = eval(self.m_y) if self.m_y else self.m_y 

        for item in (x_list + y_list):
            if 0 != item.get('kind') and 'rgl' != item.get('cmd'):
                return True

        return False



    class Meta:
        db_table = 'widgets'



class ExternalDbModel(models.Model):
    """
    数据库连接类
    """
    m_hk            = models.IntegerField(primary_key = True)
    m_kind          = models.CharField(max_length=20, default=u'postgres')
    m_ip            = models.IPAddressField(max_length=20)
    m_port          = models.IntegerField(default=5432)
    m_user          = models.CharField(max_length=20)
    m_pwd           = models.CharField(max_length=20)
    m_db            = models.CharField(max_length=20)

    def getConnTuple(self):
        return (self.m_kind, self.m_ip, self.m_port, self.m_db   \
                , self.m_user, self.m_pwd)

    def getConnDict(self):
        return {
            u'kind': self.m_kind, u'ip': self.m_ip, u'port': self.m_port \
            , u'user': self.m_user, u'pwd': self.m_pwd, u'db': self.m_db  \
        }

    def getCntHk(self):
        str = u'{kind}_{ip}_{port}_{db}_{user}_{pwd}'
        cnt = str.format(   \
            kind = self.m_kind, user = self.m_user, pwd = self.m_pwd, \
            ip = self.m_ip,   port = self.m_port, db = self.m_db   \
        )
        return hash(cnt)

    class Meta:
        db_table = 'externaldb'





