from django.db import models
from django.contrib.auth.models import User
from widget.models import ExternalDbModel

# Create your models here.
class FieldsInfo(models.Model):
    m_user = models.ForeignKey(User, db_column = 'user')
    m_conn = models.ForeignKey(ExternalDbModel, db_column = 'conn')
    m_table = models.CharField(max_length = 20, db_column = 'table')
    m_nicknames = models.CharField(max_length = 100, db_column = 'nicknames')
    m_types = models.CharField(max_length = 100, db_column = 'types')

    class meta:
        db_table = 'fieldsInfo'

