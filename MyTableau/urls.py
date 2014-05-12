from django.conf.urls import patterns, include, url
from whichdb import views as whichdbView

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'MyTableau.views.home', name='home'),
    # url(r'^MyTableau/', include('MyTableau.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^admin/', 	include(admin.site.urls)),
	url(r'^$', 			whichdbView.showDbForChosen),
	url(r'^login/', 	include('whichdb.url')),
	url(r'^main/', 		include('dbinfo.url')),
	url(r'^user/', 		include('myuser.url')),
	url(r'subject/', 	include('element.url'), {'kind': 'subject'}),
	url(r'scene/', 		include('element.url'), {'kind': 'scene'}),
	url(r'widget/', 	include('element.url'), {'kind': 'widget'}),
	#url(r'^["subject", "scene", "widget"]/', 	include('element.url')),
	url(r'^test/$', 	whichdbView.test)
)
