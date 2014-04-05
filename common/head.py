import os

FILE_PATH           	= os.path.dirname( os.path.abspath(__file__) )
PROJECT_ROOT_PATH   	= os.path.abspath( os.path.join(FILE_PATH, os.pardir) )
TEMPLATE_PATH       	= os.path.join(PROJECT_ROOT_PATH, "templates")
STATIC_PATH         	= os.path.join(PROJECT_ROOT_PATH, "static")
REQUIREJS_MODULE_PATH	= os.path.join(PROJECT_ROOT_PATH, 'rq')

	
SUPPORTED_DBS = ['postgres', 'mysql']
