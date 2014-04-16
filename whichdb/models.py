# encoding: utf-8
from django.db import models

# Create your models here.
from django.db import models


class UsedDb(models.Model):
	ip 			= models.IPAddressField(max_length=20)
	port 		= models.IntegerField()
	tablename	= models.CharField(max_length=20)
	username 	= models.CharField(max_length=20)
	pwd			= models.CharField(max_length=20)

	class Meta:
		db_table = 'useddb'

