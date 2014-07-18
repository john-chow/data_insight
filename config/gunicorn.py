#!python
"""
这是gunicorn的启动脚本
里面诸如bind等等参数都是可以在命令行中直接给gunicorn的
"""

from os import environ
from gevent import monkey
monkey.patch_all()

bind = "0.0.0.0:9000"
workers = 1 # fine for dev, you probably want to increase this number in production
worker_class = "gunicorn.workers.ggevent.GeventWorker"


'''
后台服务程序的初始化脚本
'''

