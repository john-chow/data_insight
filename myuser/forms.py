# encoding: utf-8
from django import forms
from django.contrib.auth.models import User

class UserForm(forms.ModelForm):
	username 		= forms.CharField(max_length=10)
	password		= forms.CharField(max_length=10) 
	themes  		= forms.CharField(max_length=5)
	IDENTITY_LIST	= (
		('viewer',		u'浏览者')
		, ('designer', 	u'设计者')
	)
	identity 		= forms.MultipleChoiceField(
		choices   = IDENTITY_LIST
		, widget  = forms.CheckboxSelectMultiple
	)

	class Meta:
		model = User
		fields = ('username', 'password')
