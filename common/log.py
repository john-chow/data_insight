#coding=utf-8
import sys,getopt    
import logging
import os
import ctypes
import time
from functools import wraps
from timeit import timeit
from contextlib import contextmanager
from colorlog import ColoredFormatter

import common.head as head


def timeCount(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.time()
        r = func(*args, **kwargs)
        end = time.time()
        logger.debug('{}.{} : {}'.format(func.__module__, func.__name__, end - start))
        return r
    return wrapper

@contextmanager
def timeblock(label):
    start = time.time()
    try:
        yield
    finally:
        end = time.time()
        logger.debug('{} : {}'.format(label, end - start))



def startLog(strLevel='INFO',logFile='log.txt'):
    LOGFORMAT = "  %(log_color)s%(levelname)-8s%(reset)s | %(log_color)s%(message)s%(reset)s"
    formatter = ColoredFormatter(LOGFORMAT)

    if not os.path.exists(head.LOG_PATH):
        os.mkdir(head.LOG_PATH)
    logFilename = os.path.join(head.LOG_PATH,logFile)
    
    if not strLevel in LEVELS.keys():
        strLevel='INFO'
    level=LEVELS[strLevel]

    # ColoredFormatter模块中的构造函数
    formatter = ColoredFormatter(
        format='%(asctime)s %(filename)s[line:%(lineno)d] \
                %(log_color)s%(message)s%(reset)s',
        datefmt='%m-%d %H:%M:%S',
    )
    
    logger = logging.getLogger()
    handler = logging.FileHandler(logFilename)
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    console = logging.StreamHandler()
    console.setFormatter(formatter)
    logger.addHandler(console)
    logger.setLevel(level)
    return logger

LEVELS={'DEBUG':logging.DEBUG,
        'INFO':logging.INFO,
        'WARNING':logging.WARNING,
        'ERROR':logging.ERROR,
        'CRITICAL':logging.CRITICAL,
        }

# 设置默认可打印的级别，及保存文件名
logger = startLog('DEBUG', time.strftime(
    '%Y-%m-%d_%H-%M-%S.txt' , time.localtime(time.time())
))


if __name__ == '__main__':
    log = startLog('DEBUG')
