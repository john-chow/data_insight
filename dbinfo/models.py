# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#     * Rearrange models' order
#     * Make sure each model has one field with primary_key=True
# Feel free to rename the models, but don't rename db_table values or field names.
#
# Also note: You'll have to insert the output of 'django-admin.py sqlcustom [appname]'
# into your database.
from __future__ import unicode_literals

from django.db import models

class Smart(models.Model):
    is_smart = models.CharField(max_length=5, blank=True)
    version = models.CharField(max_length=20, blank=True)
    size = models.FloatField(null=True, blank=True)
    market_time = models.DateField(null=True, blank=True)
    price = models.IntegerField(null=True, blank=True)
    net = models.CharField(max_length=20, blank=True)
    camera = models.IntegerField(null=True, blank=True)
    outlook = models.CharField(max_length=10, blank=True)
    os_all = models.CharField(max_length=20, blank=True)
    battery = models.IntegerField(null=True, blank=True)
    logo = models.CharField(max_length=10, blank=True)
    ratio = models.CharField(max_length=20, blank=True)
    color = models.CharField(max_length=8, blank=True)
    prototype = models.CharField(max_length=20, blank=True)
    cpu_hz = models.IntegerField(null=True, blank=True)
    camera_2 = models.IntegerField(null=True, blank=True)
    cpu_num = models.CharField(max_length=8, blank=True)
    run_ram = models.IntegerField(null=True, blank=True)
    nfc = models.CharField(max_length=8, blank=True)
    otg = models.CharField(max_length=8, blank=True)
    ram = models.IntegerField(null=True, blank=True)
    skuid = models.CharField(max_length=10, blank=True)
    os = models.CharField(max_length=10, blank=True)
    os_version = models.CharField(max_length=5, blank=True)
    class Meta:
        db_table = 'smart'

