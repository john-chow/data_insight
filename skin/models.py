# -*-coding: utf-8 =*=

from django.db import models

# Create your models here.

class SkinModel(models.Model):
    """
    皮肤类
    """
    m_kind  = models.IntegerField(blank = False)  #0表示主题，1表示场景，2表示组件
    m_number = models.BigIntegerField(blank = False)

    class Meta:
        db_table = 'skin'

