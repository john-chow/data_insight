# -*-coding: utf-8 =*=

from django.db import models
import os

from common.head import WIDGET_SKIN_PATH, SCENE_SKIN_PATH, SKIN_FILE_TYPE
from common.tool import readJsonFile

# Create your models here.

class SkinModel(models.Model):
    """
    皮肤类
    """

    #0表示主题，1表示场景，2表示组件
    m_cat       = models.IntegerField(blank = False, db_column = 'category')  
    m_name      = models.CharField(max_length = 10, db_column = 'name')
    m_author    = models.CharField(max_length = 20, db_column = 'author')
    m_number    = models.BigIntegerField(blank = False, db_column = 'number')
    m_time      = models.DateTimeField(auto_now_add = True, db_column = 'modify_time')

    def getSkinDict(self):
        if 1 == self.m_cat:
            path_head   = SCENE_SKIN_PATH
        elif 2 == self.m_cat:
            path_head   = WIDGET_SKIN_PATH
        else:
            return {}

        file_name = os.path.abspath(path_head + str(self.m_number) + SKIN_FILE_TYPE)
        data = readJsonFile(file_name)
        return data
        


    class Meta:
        db_table = 'skin'

