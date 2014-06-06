from django.conf.urls import patterns, include, url
from django.contrib.auth.views import login, logout
from account import views

urlpatterns = patterns('',
    # Uncomment the next line to enable the admin:
    url(r'^$',				views.mylogin),
    url(r'^login/$', 		views.mylogin),
    url(r'^logout/$', 		views.mylogout),
	url(r'^register/$', 	views.myregister),
)
