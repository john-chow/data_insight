from django.conf.urls import patterns, include, url
from skin import views

urlpatterns = patterns('',
    # Uncomment the next line to enable the admin:
    url(r'^list/(\w+)/$',               views.skinList),
    url(r'^create',                     views.skinCreate),
    url(r'^delete',                     views.skinDelete),
    url(r'^detail/(\w+)/(\d+)/$',       views.skinDetail)
)
