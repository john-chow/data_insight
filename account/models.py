from django.db import models

class AccountModel(models.Model):
	name 		= models.CharField(max_length=10)
	pwd  		= models.CharField(max_length=10)
	themes  	= models.CharField(max_length=5)

	IDENTITY_LIST	= (
		('viewer',		'viewer11')
		, ('designer', 	'designer11')
	)
	identity 	= models.CharField(max_length=20
									)
