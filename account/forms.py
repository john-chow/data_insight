# encoding: utf-8
from django import forms
from django.contrib.auth.models import User

class AccountForm(forms.ModelForm):
	username 		= forms.CharField(max_length=10, )
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

	def clean_username(self): 
		username = self.cleaned_data.get('username') 
		try:
			user = User.objects.get(username=username)
		except User.DoesNotExist:
			print u'新建用户'
		else:
			print u'该用户名已经存在'
			raise forms.ValidationError(u"该用户名已经存在")
		return username

	class Meta:
		model = User
		fields = ('username', 'password')
