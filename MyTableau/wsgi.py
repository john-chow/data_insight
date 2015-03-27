import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'MyTableau.settings')
from django.conf import settings
from django.core.wsgi import get_wsgi_application
from ws4redis.uwsgi_runserver import uWSGIWebsocketServer
import pdb

_django_app = get_wsgi_application()
_websocket_app = uWSGIWebsocketServer()
pdb.set_trace()

def application(environ, start_response):
    pdb.set_trace()
    if environ.get('PATH_INFO').startswith(settings.WEBSOCKET_URL):
        return _websocket_app(environ, start_response)
    return _django_app(environ, start_response)

