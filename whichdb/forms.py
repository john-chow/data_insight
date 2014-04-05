from django import forms

class ConnDbForm(forms.Form):
	ip			= forms.GenericIPAddressField()
	port		= forms.IntegerField(max_value=65535, min_value=0, required=False)
	db			= forms.CharField()
	table		= forms.CharField()
	user		= forms.CharField()
	pwd			= forms.CharField(widget=forms.PasswordInput())

