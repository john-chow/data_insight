from django.conf.urls import patterns, include, url
from user import views

urlpatterns = patterns('',
    # Uncomment the next line to enable the admin:
    url(r'^login/', 		views.login),
	url(r'^register/$', 	views.register),
)
