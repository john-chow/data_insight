# -*- coding: utf-8 -*-

from django.db import models
from django.utils import simplejson as json

from MyTableau.models import ElementModel
from common.head import WIDGET_SKIN_PATH, SKIN_FILE_TYPE
from common.tool import readJsonFile
import common.protocol as Protocol

import pdb
# Create your models here.

REFRESH_CHOICES = ['no', '10s', '30s', '1m', '5m', '1h']

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
    m_refresh       = models.CharField(max_length = 8, default = 'No')
    m_skin          = models.CharField(db_column = 'skin', max_length = 16, \
                                        default = 'default')
    m_pic           = models.TextField(db_column='snapshot')
    m_external_db   = models.ForeignKey('ExternalDbModel')

    def getConn(self):
        return self.m_external_db

    def getConnPk(self):
        return self.m_external_db.getConnPk()

    def restoreReqDataDict(self):
        return { 
            Protocol.Xaxis:     eval(self.m_x) if self.m_x else self.m_x 
            , Protocol.Yaxis:   eval(self.m_y) if self.m_y else self.m_y
            #, 'tables':         json.loads(self.m_table) 
            , Protocol.Color:   eval(self.m_color) if self.m_color else self.m_color 
            , Protocol.Size:    self.m_size 
            , Protocol.Graph:   self.m_graph 
            , 'table':          self.m_table
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

    def restore(self):
        """
        返回组件内容数据
        """
        return {
            Protocol.Graph:         self.m_graph
            , Protocol.Xaxis:       eval(self.m_x)
            , Protocol.Yaxis:       eval(self.m_y)
            , Protocol.Mapping:     {
                Protocol.Color:         eval(self.m_color)
                , Protocol.Size:        eval(self.m_size)
            }
            , Protocol.Refresh:     self.m_refresh
            , Protocol.Style:       self.m_skin
            , Protocol.IsPublish:   self.m_status
            , Protocol.Color:       self.m_color
            , Protocol.Size:        self.m_size
            , Protocol.WidgetName:  self.m_name
            , 'filter':             []
        }

    def restoreUsedTables(self):
        items = [eval(item) for item in \
                    (self.m_x, self.m_y, self.m_color, self.m_size)]
        flat_items = [i for ii in items for i in ii]
        tables = map(lambda i: i.get('table'), flat_items)
        return list(set(tables))


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

    def getPk(self):
        return self.m_hk

    class Meta:
        db_table = 'externaldb'





