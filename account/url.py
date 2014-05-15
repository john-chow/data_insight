from django.conf.urls import patterns, include, url
from account import views

urlpatterns = patterns('',
    # Uncomment the next line to enable the admin:
    url(r'^$',				views.mylogin),
    url(r'^login/$', 		views.mylogin),
	url(r'^register/$', 	views.myregister),
)
