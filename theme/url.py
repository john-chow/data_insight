from django.conf.urls import patterns, include, url
from theme import views

urlpatterns = patterns('',
    # Uncomment the next line to enable the admin:
    url(r'^$', 			views.themeList),
	url(r'^list/$', 	views.themeList),
	url(r'^create/$', 	views.themeCreate),
	url(r'^delete/$', 	views.themeDelete),
	url(r'^edit/$', 	views.themeEdit),
)
