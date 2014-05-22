import os

FILE_PATH           	= os.path.dirname( os.path.abspath(__file__) )
PROJECT_ROOT_PATH   	= os.path.abspath( os.path.join(FILE_PATH, os.pardir) )
TEMPLATE_PATH       	= os.path.join(PROJECT_ROOT_PATH, "templates")
STATIC_PATH         	= os.path.join(PROJECT_ROOT_PATH, "static")
REQUIREJS_MODULE_PATH	= os.path.join(PROJECT_ROOT_PATH, 'templates/widget/add')

TEMP_DRAW_DATA_FILE		= os.path.join(PROJECT_ROOT_PATH, 'temp/111.json')

IS_RELEASE				= True
HAVE_PDB				= False

# for debug in linux
DEBUG_IN_LINUX          = True

	
SUPPORTED_DBS = ['postgres', 'mysql']
