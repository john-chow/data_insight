# -*-coding: utf-8 -*-
import os
from collections import namedtuple

FILE_PATH           	= os.path.dirname( os.path.abspath(__file__) )
PROJECT_ROOT_PATH   	= os.path.abspath( os.path.join(FILE_PATH, os.pardir) )
TEMPLATE_PATH       	= os.path.join(PROJECT_ROOT_PATH, "templates")
STATIC_PATH         	= os.path.join(PROJECT_ROOT_PATH, "static")
REQUIREJS_MODULE_PATH	= os.path.join(PROJECT_ROOT_PATH, 'templates/widget/add')
MARIONETTE_PATH         = os.path.join(PROJECT_ROOT_PATH, 'templates/widget/widget_add')

TEMP_DRAW_DATA_FILE		= os.path.join(PROJECT_ROOT_PATH, 'temp/111.json')
LOG_PATH                = os.path.join(PROJECT_ROOT_PATH, 'log')

#皮肤文件
SCENE_SKIN_PATH         = os.path.join(PROJECT_ROOT_PATH, "static/skin/scene/")
WIDGET_SKIN_PATH        = os.path.join(PROJECT_ROOT_PATH, "static/skin/widget/")
SKIN_FILE_TYPE          = '.json'


# 匹配日期的正则表达式
REGEX_FOR_DATE          = '^(?:(?!0000)[0-9]{4}([-/.]?)(?:(?:0?[1-9]|1[0-2])([-/.]?)(?:0?[1-9]|1[0-9]|2[0-8])|(?:0?[13-9]|1[0-2])([-/.]?)(?:29|30)|(?:0?[13578]|1[02])([-/.]?)31)|(?:[0-9]{2}(?:0[48]|[2468][048]|[13579][26])|(?:0[48]|[2468][048]|[13579][26])00)([-/.]?)0?2([-/.]?)29)$'

# 匹配数字的正则表达式
REGEX_FOR_NUMBER        = '^(-)?(?!(0[0-9]{0,}$))[0-9]{1,}[.]{0,}[0-9]{0,}$'

	
SUPPORTED_DBS = ['postgres', 'mysql']

ConnArgsList = ['ip', 'port', 'db', 'user', 'pwd', 'kind']
ConnNamedtuple = namedtuple('ConnNamedtuple', ConnArgsList)

# 默认数据信息
DEFAULT_DB = ConnNamedtuple( \
    '10.1.50.125', '5432', 'temp', 'postgres', '123456', 'postgres' \
)

