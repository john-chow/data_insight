# encoding: utf-8
from django import forms

class ConnDbForm(forms.Form):
	ip			= forms.GenericIPAddressField(initial='10.1.50.96')
	port		= forms.IntegerField(max_value=65535, min_value=0, required=False, initial='5432')
	db			= forms.CharField(initial='data_insight')
	user		= forms.CharField(initial='postgres')
	pwd			= forms.CharField(widget=forms.PasswordInput())

