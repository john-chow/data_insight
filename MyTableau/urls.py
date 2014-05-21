from django.conf.urls import patterns, include, url
from MyTableau import views

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
    url(r'^$', 			views.index),
    url(r'^test/$', 	views.test),
    url(r'^admin/', 	include(admin.site.urls)),
    url(r'^account/', 	include('account.url')),
    url(r'^widget/', 	include('widget.url')),
    url(r'^scene/', 	include('scene.url')),
    url(r'^theme/', 	include('theme.url')),
)
