# -*-coding: utf-8 =*=

from django.db import models
import os
import pdb

from MyTableau.models import ElementModel
from common.head import WIDGET_SKIN_PATH, SCENE_SKIN_PATH, SKIN_FILE_TYPE
from common.tool import readJsonFile, writeJsonFile

# Create your models here.

class SkinModel(ElementModel):
    """
    皮肤类
    """

    #0表示主题，1表示场景，2表示组件
    m_cat = models.IntegerField(blank = False, db_column = 'category')  

    @classmethod
    def find(cls, id):
        '''
        用来替代M.objects.get()函数的
        '''
        try:
            model = cls.objects.get(pk = id)
        except cls.DoesNotExist, e:
            raise(e)

        if 1 == model.m_cat:
            model.path_head = SCENE_SKIN_PATH
        elif 2 == model.m_cat:
            model.path_head = WIDGET_SKIN_PATH

        return model


    @classmethod
    def create(cls, **kwargs):
        '''
        用来替代M.objects.create()函数
        '''
        try:
            model = cls.objects.create(**kwargs)
        except Exception, e:
            raise(e)

        cat = kwargs.get('m_cat', 2)
        if 1 == cat:
            model.path_head = SCENE_SKIN_PATH
        else:
            model.path_head = WIDGET_SKIN_PATH

        return model


    def getSkinDict(self):
        file_name = os.path.abspath(
            self.path_head + self.m_name + SKIN_FILE_TYPE
        )
        data = readJsonFile(file_name)
        return data

    def saveSkinDict(self, data):
        file_name = os.path.abspath(
            self.path_head + self.m_name + SKIN_FILE_TYPE
        )
        writeJsonFile(file_name, data)

    class Meta:
        db_table = 'skin'

