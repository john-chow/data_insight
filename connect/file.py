#-*-coding: utf-8 -*-

from __future__ import division
from datetime import datetime
import xlrd
import os, re

from connect.sqltool import SqlObjReader
from common.head import REGEX_FOR_NUMBER, REGEX_FOR_DATE

import pdb


# 第1行是列头信息，第2行开始才是数据
DATA_LINE_START_IN_FILE = 1

# 判断列类型的阀值
COLUMN_TYPE_THRESHOLD   = 0.8



def judgeColumnTypes(cols_data):
    cols_types = []
    for each_col_data in cols_data:
        each_col_type = judgeGroupType(each_col_data)
        cols_types.append(each_col_type)

    return cols_types


def getDataTypes(data_list):
    types = []
    for data in data_list:
        type = judgeVarType(data)
        types.append(type)

    return types


def judgeVarType(var):
    # 检查是否是时间
    if re.match(REGEX_FOR_DATE, var):
        return 'datatime'
    # 检查是否是数值类型
    elif re.match(REGEX_FOR_NUMBER, var):
        return 'float'
    else:
        return 'str'
    

def judgeGroupType(data_list):
    total_num = len(data_list)
    time_count, int_count = 0, 0

    for data in data_list:
        pdb.set_trace()
        # 检查是否是时间
        if re.match(REGEX_FOR_DATE, data):
            time_count  += 1
        # 检查是否是数值类型
        elif re.match(REGEX_FOR_NUMBER, data):
            int_count   += 1

    # 阀值为80%
    if time_count / total_num > COLUMN_TYPE_THRESHOLD:
        type = 'datetime'
    elif int_count / total_num > COLUMN_TYPE_THRESHOLD:
        type = 'float'
    else:
        type = 'str'

    return type


class BaseFile():
    def __init__(self, st, name):
        self.TEST_ROWS_NUM = 10
        self.st = st
        self.name = name

    def ensureColumnType(self, one_column_types_list):
        """
        判断float/int，以及date类型是否有超过阀值
        如果没有，则为str类型
        """
        float_num = one_column_types_list.count('float') + one_column_types_list.count(2)
        date_num  = one_column_types_list.count('date') + one_column_types_list.count(3)
        all_num   = len(one_column_types_list)

        if (float_num / all_num) > COLUMN_TYPE_THRESHOLD:
            return 'float'
        elif (date_num / all_num) > COLUMN_TYPE_THRESHOLD:
            return 'date'
        else:
            return 'str'

    def cvtTypesToStTypes(self, column_heads, column_types):
        # 根据用户指定的类型
        st_col_list = []
        for col, type in zip(column_heads, column_types):
            st_col = SqlObjReader().defColumn(col, type)
            st_col_list.append(st_col)
        return st_col_list


    def readColumnHead():
        pass

    def judgeColumnType():
        pass

    def reflectToTable(self):
        pass

    def copyContentsToTable():
        pass

    def readDataForJudgeColumnType(self):
        pass

    def getTable(self):
        return self.table

    def getType(self):
        return self.type

    def getSt(self):
        return self.st


class Text(BaseFile):
    def __init__(self, st, f, name):
        self.f = f
        BaseFile.__init__(self, st, name)

    def reflectToTable(self):
        column_heads    = self.readColumnHead()

        test_cols_data  = self.readDataForJudgeColumnType()
        #column_types    = judgeColumnTypes(test_cols_data)

        column_types = []
        for col_data in test_cols_data:
            types = getDataTypes(col_data)
            column_type = self.ensureColumnType(types)
            column_types.append(column_type)

        if len(column_heads) != len(column_types):
            raise Exception('xxxxxxxxxxxxx')

        st_col_list  = self.cvtTypesToStTypes(column_heads, column_types)
        self.table  = self.st.createTable(self.name, *tuple(st_col_list))
        self.copyContentsToTable()
        return self.table

    def readColumnHead(self):
        pos = self.f.tell()
        self.f.seek(0)
        column_heads    = [w.strip() for w in self.f.readline().split(self.spliter)]
        self.f.seek(pos)
        return column_heads

    def copyContentsToTable(self):
        """
        把文件中数据拷贝进入数据表
        """
        # 越过第一行列信息
        self.f.seek(0)
        self.f.readline()

        line = self.f.readline()
        while line:
            line_data       = [w.strip() for w in line.split(self.spliter)]
            ins = self.table.insert().values(tuple(line_data))
            try:
                self.st.conn.execute(ins)
            except Exception, e:
                pass
            finally:
                line = self.f.readline()


    def readDataForJudgeColumnType(self):
        column_heads = self.readColumnHead()
        column_length = len(column_heads)

        i, test_rows_data = DATA_LINE_START_IN_FILE, []
        while(i < self.TEST_ROWS_NUM):
            test_one_row_data = [w.strip() for w in self.f.readline().split(self.spliter)]
            if len(test_one_row_data) < column_length:
                continue
            test_rows_data.append(test_one_row_data)
            i += 1


        test_cols_data = [[row[i] for row in test_rows_data] \
                                for i in range(column_length)]

        return test_cols_data


    def getSpliter(self):
        return self.spliter


    def setSpliter(self, spliter):
        self.spliter = spliter
        return 



class Sheet(BaseFile):
    def __init__(self, st, name, worksheet):
        self.worksheet = worksheet
        BaseFile.__init__(self, st, name)
        

    def readColumnHead(self):
        # 默认第一行是列头信息
        column_heads = self.worksheet.row_values(0)        
        return column_heads


    def readDataForJudgeColumnType(self):
        col_num = self.worksheet.ncols
        columns_data = []
        for i in range(0, col_num):
            one_column_cells = self.worksheet.col_slice(  \
                i, start_rowx = DATA_LINE_START_IN_FILE, end_rowx = self.TEST_ROWS_NUM \
            )
            one_column_data = self.cvtCellsToValuesTuple(one_column_cells)
            columns_data.append(one_column_data)

        return columns_data


    def readColumnTypes(self):
        col_num = self.worksheet.ncols
        column_types = []
        for i in range(col_num):
            one_column_types = self.worksheet.col_types( \
                i, start_rowx = DATA_LINE_START_IN_FILE, end_rowx = self.TEST_ROWS_NUM \
            )
            column_type = self.ensureColumnType(one_column_types)
            column_types.append(column_type)

        return column_types


    def copyContentsToTable(self):
        row_num = self.worksheet.nrows
        for i in range(DATA_LINE_START_IN_FILE, row_num):
            row_cells   = self.worksheet.row(i)
            row_values  = self.cvtCellsToValuesTuple(row_cells)

            ins = self.table.insert().values(tuple(row_values))
            try:
                self.st.conn.execute(ins)
            except Exception, e:
                pass

    def cvtCellsToValuesTuple(self, cells):
        data_list = []
        for cell in cells:
            # 时间格式，需要转换
            if 3 == cell.ctype:
                try:
                    datetime_str = datetime( \
                        *xlrd.xldate_as_tuple(cell.value, self.datemode) \
                    ).strftime('%Y-%m-%d %H:%M:%S')
                except ValueError,e:
                    pass
                else:
                    data_list.append(datetime_str)
            else:
                data_list.append(cell.value)

        return data_list
                

    def reflectToTable(self):
        column_heads    = self.readColumnHead()
        column_types    = self.readColumnTypes()

        """
        test_cols_data  = self.readDataForJudgeColumnType()
        column_types    = judgeColumnTypes(test_cols_data)
        """

        st_col_list  = self.cvtTypesToStTypes(column_heads, column_types)
        self.table  = self.st.createTable(self.name, *tuple(st_col_list))
        self.copyContentsToTable()
        return self.table


    def getSheet(self):
        return self.worksheet

    def setDatemode(self, datemode):
        self.datemode = datemode



class Excel():
    def __init__(self, f, name):
        self.name = name
        self.workbook = xlrd.open_workbook(file_contents = f.read())
        self.sheet_list = []

    def reflectToTables(self, st, sheets):
        for sheet_name in sheets:
            worksheet   = self.workbook.sheet_by_name(sheet_name)
            sheet_obj   = Sheet(st, sheet_name, worksheet)
            sheet_obj.setDatemode(self.workbook.datemode)
            sheet_obj.reflectToTable()
            self.sheet_list.append(sheet_obj)

    def getSheetList(self):
        return self.sheet_list

    def getName(self):
        return self.name

            

