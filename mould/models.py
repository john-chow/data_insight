# -*- coding: utf-8 -*-

from django.db import models

from MyTableau.models import ElementModel
class MouldModel(ElementModel):
    """
    自定义模板类
    """
    m_content = models.TextField(db_column = 'content')
    m_is_pure = models.BooleanField(db_column = 'pure')

    def getContent(self):
        return self.m_content

    def setContent(self):
        return self.m_content

    content = property(fget = getContent, fset = setContent)
    del getContent, setContent

    class Meta:
        db_table = 'moulds'


# Create your models here.
