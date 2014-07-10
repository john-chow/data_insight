#-*- coding: utf-8 -*-
'''
周期性定时器
'''
from threading import Timer

class MyTimer():
    def __init__(self, interval, callback, *args, **kwargs):
        '''
        初始化函数
        args和kwargs都是给callback的参数
        '''
        self.interval   = interval
        self.callback   = callback
        self.args       = args
        self.kwargs     = kwargs
        self.timer      = None

    def start(self):
        '''
        启动
        '''
        if self.timer:
            raise Exception('aaaaaaaaaaa')

        self.run()

    def restart(self):
        pass

    def pause(self):
        pass

    def cancel(self):
        '''
        取消
        '''
        self.timer.cancel()

    def run(self):
        '''
        运行中
        '''
        self.callback(*self.args, **self.kwargs)
        self.timer = Timer(self.interval, self.run).start()

    def getTheadId(self):
        '''
        获取定时器线程id
        '''
        return self.timer.get_ident()


