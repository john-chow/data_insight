# encoding: utf-8
from django import forms
from user.model import UserModel

class UserForm(forms.ModelForm):
	name 			= forms.CharField(max_length=10)
	pwd				= forms.CharField(max_length=10) 
	themes  		= forms.CharField(max_length=5)
	IDENTITY_LIST	= (
		('viewer',		'viewer11')
		, ('designer', 	'designe11r')
	)
	identity 	= forms.CharField(max_length=2)

	class Meta:
		model = UserModel
