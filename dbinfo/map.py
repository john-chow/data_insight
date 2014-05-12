# -*- coding: utf-8 -*-
import random

def getChinaMainCityCoord():
	return {
		u'上海': [121.4648,31.2891],
		u'东莞': [113.8953,22.901],
		u'东营': [118.7073,37.5513],
		u'中山': [113.4229,22.478],
		u'临汾': [111.4783,36.1615],
		u'临沂': [118.3118,35.2936],
		u'丹东': [124.541,40.4242],
		u'丽水': [119.5642,28.1854],
		u'乌鲁木齐': [87.9236,43.5883],
		u'佛山': [112.8955,23.1097],
		u'保定': [115.0488,39.0948],
		u'兰州': [103.5901,36.3043],
		u'包头': [110.3467,41.4899],
		u'北京': [116.4551,40.2539],
		u'北海': [109.314,21.6211],
		u'南京': [118.8062,31.9208],
		u'南宁': [108.479,23.1152],
		u'南昌': [116.0046,28.6633],
		u'南通': [121.1023,32.1625],
		u'厦门': [118.1689,24.6478],
		u'台州': [121.1353,28.6688],
		u'合肥': [117.29,32.0581],
		u'呼和浩特': [111.4124,40.4901],
		u'咸阳': [108.4131,34.8706],
		u'哈尔滨': [127.9688,45.368],
		u'唐山': [118.4766,39.6826],
		u'嘉兴': [120.9155,30.6354],
		u'大同': [113.7854,39.8035],
		u'大连': [122.2229,39.4409],
		u'天津': [117.4219,39.4189],
		u'太原': [112.3352,37.9413],
		u'威海': [121.9482,37.1393],
		u'宁波': [121.5967,29.6466],
		u'宝鸡': [107.1826,34.3433],
		u'宿迁': [118.5535,33.7775],
		u'常州': [119.4543,31.5582],
		u'广州': [113.5107,23.2196],
		u'廊坊': [116.521,39.0509],
		u'延安': [109.1052,36.4252],
		u'张家口': [115.1477,40.8527],
		u'徐州': [117.5208,34.3268],
		u'德州': [116.6858,37.2107],
		u'惠州': [114.6204,23.1647],
		u'成都': [103.9526,30.7617],
		u'扬州': [119.4653,32.8162],
		u'承德': [117.5757,41.4075],
		u'拉萨': [91.1865,30.1465],
		u'无锡': [120.3442,31.5527],
		u'日照': [119.2786,35.5023],
		u'昆明': [102.9199,25.4663],
		u'杭州': [119.5313,29.8773],
		u'枣庄': [117.323,34.8926],
		u'柳州': [109.3799,24.9774],
		u'株洲': [113.5327,27.0319],
		u'武汉': [114.3896,30.6628],
		u'汕头': [117.1692,23.3405],
		u'江门': [112.6318,22.1484],
		u'沈阳': [123.1238,42.1216],
		u'沧州': [116.8286,38.2104],
		u'河源': [114.917,23.9722],
		u'泉州': [118.3228,25.1147],
		u'泰安': [117.0264,36.0516],
		u'泰州': [120.0586,32.5525],
		u'济南': [117.1582,36.8701],
		u'济宁': [116.8286,35.3375],
		u'海口': [110.3893,19.8516],
		u'淄博': [118.0371,36.6064],
		u'淮安': [118.927,33.4039],
		u'深圳': [114.5435,22.5439],
		u'清远': [112.9175,24.3292],
		u'温州': [120.498,27.8119],
		u'渭南': [109.7864,35.0299],
		u'湖州': [119.8608,30.7782],
		u'湘潭': [112.5439,27.7075],
		u'滨州': [117.8174,37.4963],
		u'潍坊': [119.0918,36.524],
		u'烟台': [120.7397,37.5128],
		u'玉溪': [101.9312,23.8898],
		u'珠海': [113.7305,22.1155],
		u'盐城': [120.2234,33.5577],
		u'盘锦': [121.9482,41.0449],
		u'石家庄': [114.4995,38.1006],
		u'福州': [119.4543,25.9222],
		u'秦皇岛': [119.2126,40.0232],
		u'绍兴': [120.564,29.7565],
		u'聊城': [115.9167,36.4032],
		u'肇庆': [112.1265,23.5822],
		u'舟山': [122.2559,30.2234],
		u'苏州': [120.6519,31.3989],
		u'莱芜': [117.6526,36.2714],
		u'菏泽': [115.6201,35.2057],
		u'营口': [122.4316,40.4297],
		u'葫芦岛': [120.1575,40.578],
		u'衡水': [115.8838,37.7161],
		u'衢州': [118.6853,28.8666],
		u'西宁': [101.4038,36.8207],
		u'西安': [109.1162,34.2004],
		u'贵阳': [106.6992,26.7682],
		u'连云港': [119.1248,34.552],
		u'邢台': [114.8071,37.2821],
		u'邯郸': [114.4775,36.535],
		u'郑州': [113.4668,34.6234],
		u'鄂尔多斯': [108.9734,39.2487],
		u'重庆': [107.7539,30.1904],
		u'金华': [120.0037,29.1028],
		u'铜川': [109.0393,35.1947],
		u'银川': [106.3586,38.1775],
		u'镇江': [119.4763,31.9702],
		u'长春': [125.8154,44.2584],
		u'长沙': [113.0823,28.2568],
		u'长治': [112.8625,36.4746],
		u'阳泉': [113.4778,38.0951],
		u'青岛': [120.4651,36.3373],
		u'韶关': [113.7964,24.7028]
	}


def getCityPM2dot5():
	return [
		{u'name': u"海门", 			u'value': 9},
		{u'name': u"鄂尔多斯", 		u'value': 12},
		{u'name': u"招远", 			u'value': 12},
		{u'name': u"舟山",			u'value': 12},
		{u'name': u"齐齐哈尔", 		u'value': 14},
		{u'name': u"盐城", 			u'value': 15},
		{u'name': u"赤峰", 			u'value': 16},
		{u'name': u"青岛", 			u'value': 18},
		{u'name': u"乳山", 			u'value': 18},
		{u'name': u"金昌", 			u'value': 19},
		{u'name': u"泉州", 			u'value': 21},
		{u'name': u"莱西", 			u'value': 21},
		{u'name': u"日照", 			u'value': 21},
		{u'name': u"胶南", 			u'value': 22},
		{u'name': u"南通", 			u'value': 23},
		{u'name': u"拉萨", 			u'value': 24},
		{u'name': u"云浮", 			u'value': 24},
		{u'name': u"梅州", 			u'value': 25},
		{u'name': u"文登", 			u'value': 25},
		{u'name': u"上海", 			u'value': 25},
		{u'name': u"攀枝花", 		u'value': 25},
		{u'name': u"威海", 			u'value': 25},
		{u'name': u"承德", 			u'value': 25},
		{u'name': u"厦门", 			u'value': 26},
		{u'name': u"汕尾", 			u'value': 26},
		{u'name': u"潮州", 			u'value': 26},
		{u'name': u"丹东", 			u'value': 27},
		{u'name': u"太仓", 			u'value': 27},
		{u'name': u"曲靖", 			u'value': 27},
		{u'name': u"烟台", 			u'value': 28},
		{u'name': u"福州", 			u'value': 29},
		{u'name': u"瓦房店", 		u'value': 30},
		{u'name': u"即墨", 			u'value': 30},
		{u'name': u"抚顺",			u'value': 31},
		{u'name': u"玉溪", 			u'value': 31},
		{u'name': u"张家口", 		u'value': 31},
		{u'name': u"阳泉", 			u'value': 31},
		{u'name': u"莱州", 			u'value': 32},
		{u'name': u"湖州", 			u'value': 32},
		{u'name': u"汕头", 			u'value': 32},
		{u'name': u"昆山", 			u'value': 33},
		{u'name': u"宁波", 			u'value': 33},
		{u'name': u"湛江", 			u'value': 33},
		{u'name': u"揭阳", 			u'value': 34},
		{u'name': u"荣成", 			u'value': 34},
		{u'name': u"连云港", 		u'value': 35},
		{u'name': u"葫芦岛", 		u'value': 35},
		{u'name': u"常熟", 			u'value': 36},
		{u'name': u"东莞", 			u'value': 36},
		{u'name': u"河源", 			u'value': 36},
		{u'name': u"淮安", 			u'value': 36},
		{u'name': u"泰州", 			u'value': 36},
		{u'name': u"南宁", 			u'value': 37},
		{u'name': u"营口", 			u'value': 37},
		{u'name': u"惠州", 			u'value': 37},
		{u'name': u"江阴", 			u'value': 37},
		{u'name': u"蓬莱", 			u'value': 37},
		{u'name': u"韶关", 			u'value': 38},
		{u'name': u"嘉峪关", 		u'value': 38},
		{u'name': u"广州", 			u'value': 38},
		{u'name': u"延安", 			u'value': 38},
		{u'name': u"太原", 			u'value': 39},
		{u'name': u"清远", 			u'value': 39},
		{u'name': u"中山", 			u'value': 39},
		{u'name': u"昆明", 			u'value': 39},
		{u'name': u"寿光", 			u'value': 40},
		{u'name': u"盘锦", 			u'value': 40},
		{u'name': u"长治", 			u'value': 41},
		{u'name': u"深圳", 			u'value': 41},
		{u'name': u"珠海", 			u'value': 42},
		{u'name': u"宿迁", 			u'value': 43},
		{u'name': u"咸阳", 			u'value': 43},
		{u'name': u"铜川", 			u'value': 44},
		{u'name': u"平度", 			u'value': 44},
		{u'name': u"佛山", 			u'value': 44},
		{u'name': u"海口", 			u'value': 44},
		{u'name': u"江门", 			u'value': 45},
		{u'name': u"章丘", 			u'value': 45},
		{u'name': u"肇庆", 			u'value': 46},
		{u'name': u"大连", 			u'value': 47},
		{u'name': u"临汾", 			u'value': 47},
		{u'name': u"吴江", 			u'value': 47},
		{u'name': u"石嘴山", 		u'value': 49},
		{u'name': u"沈阳", 			u'value': 50},
		{u'name': u"苏州", 			u'value': 50},
		{u'name': u"茂名", 			u'value': 50},
		{u'name': u"嘉兴", 			u'value': 51},
		{u'name': u"长春", 			u'value': 51},
		{u'name': u"胶州", 			u'value': 52},
		{u'name': u"银川", 			u'value': 52},
		{u'name': u"张家港", 		u'value': 52},
		{u'name': u"三门峡", 		u'value': 53},
		{u'name': u"锦州", 			u'value': 54},
		{u'name': u"南昌", 			u'value': 54},
		{u'name': u"柳州", 			u'value': 54},
		{u'name': u"三亚", 			u'value': 54},
		{u'name': u"自贡", 			u'value': 56},
		{u'name': u"吉林", 			u'value': 56},
		{u'name': u"阳江", 			u'value': 57},
		{u'name': u"泸州", 			u'value': 57},
		{u'name': u"西宁", 			u'value': 57},
		{u'name': u"宜宾", 			u'value': 58},
		{u'name': u"呼和浩特", 		u'value': 58},
		{u'name': u"成都", 			u'value': 58},
		{u'name': u"大同", 			u'value': 58},
		{u'name': u"镇江", 			u'value': 59},
		{u'name': u"桂林", 			u'value': 59},
		{u'name': u"张家界", 		u'value': 59},
		{u'name': u"宜兴", 			u'value': 59},
		{u'name': u"北海", 			u'value': 60},
		{u'name': u"西安", 			u'value': 61},
		{u'name': u"金坛", 			u'value': 62},
		{u'name': u"东营", 			u'value': 62},
		{u'name': u"牡丹江", 		u'value': 63},
		{u'name': u"遵义", 			u'value': 63},
		{u'name': u"绍兴", 			u'value': 63},
		{u'name': u"扬州", 			u'value': 64},
		{u'name': u"常州", 			u'value': 64},
		{u'name': u"潍坊", 			u'value': 65},
		{u'name': u"重庆", 			u'value': 66},
		{u'name': u"台州", 			u'value': 67},
		{u'name': u"南京", 			u'value': 67},
		{u'name': u"滨州", 			u'value': 70},
		{u'name': u"贵阳", 			u'value': 71},
		{u'name': u"无锡", 			u'value': 71},
		{u'name': u"本溪", 			u'value': 71},
		{u'name': u"克拉玛依", 		u'value': 72},
		{u'name': u"渭南", 			u'value': 72},
		{u'name': u"马鞍山", 		u'value': 72},
		{u'name': u"宝鸡", 			u'value': 72},
		{u'name': u"焦作", 			u'value': 75},
		{u'name': u"句容", 			u'value': 75},
		{u'name': u"北京", 			u'value': 79},
		{u'name': u"徐州", 			u'value': 79},
		{u'name': u"衡水", 			u'value': 80},
		{u'name': u"包头", 			u'value': 80},
		{u'name': u"绵阳", 			u'value': 80},
		{u'name': u"乌鲁木齐", 		u'value': 84},
		{u'name': u"枣庄", 			u'value': 84},
		{u'name': u"杭州", 			u'value': 84},
		{u'name': u"淄博", 			u'value': 85},
		{u'name': u"鞍山", 			u'value': 86},
		{u'name': u"溧阳", 			u'value': 86},
		{u'name': u"库尔勒", 		u'value': 86},
		{u'name': u"安阳", 			u'value': 90},
		{u'name': u"开封", 			u'value': 90},
		{u'name': u"济南", 			u'value': 92},
		{u'name': u"德阳", 			u'value': 93},
		{u'name': u"温州", 			u'value': 95},
		{u'name': u"九江", 			u'value': 96},
		{u'name': u"邯郸", 			u'value': 98},
		{u'name': u"临安", 			u'value': 99},
		{u'name': u"兰州", 			u'value': 99},
		{u'name': u"沧州", 			u'value': 100},
		{u'name': u"临沂", 			u'value': 103},
		{u'name': u"南充", 			u'value': 104},
		{u'name': u"天津", 			u'value': 105},
		{u'name': u"富阳", 			u'value': 106},
		{u'name': u"泰安", 			u'value': 112},
		{u'name': u"诸暨", 			u'value': 112},
		{u'name': u"郑州", 			u'value': 113},
		{u'name': u"哈尔滨", 		u'value': 114},
		{u'name': u"聊城", 			u'value': 116},
		{u'name': u"芜湖", 			u'value': 117},
		{u'name': u"唐山", 			u'value': 119},
		{u'name': u"平顶山", 		u'value': 119},
		{u'name': u"邢台", 			u'value': 119},
		{u'name': u"德州", 			u'value': 120},
		{u'name': u"济宁", 			u'value': 120},
		{u'name': u"荆州", 			u'value': 127},
		{u'name': u"宜昌", 			u'value': 130},
		{u'name': u"义乌", 			u'value': 132},
		{u'name': u"丽水", 			u'value': 133},
		{u'name': u"洛阳", 			u'value': 134},
		{u'name': u"秦皇岛", 		u'value': 136},
		{u'name': u"株洲", 			u'value': 143},
		{u'name': u"石家庄", 		u'value': 147},
		{u'name': u"莱芜", 			u'value': 148},
		{u'name': u"保定", 			u'value': 153},
		{u'name': u"湘潭", 			u'value': 154},
		{u'name': u"金华", 			u'value': 157},
		{u'name': u"长沙", 			u'value': 175},
		{u'name': u"衢州", 			u'value': 177},
		{u'name': u"廊坊", 			u'value': 193},
		{u'name': u"菏泽", 			u'value': 194},
		{u'name': u"合肥", 			u'value': 229},
		{u'name': u"武汉", 			u'value': 273},
	]


def getRailLine():
	return [
		[{u'name':u'北京'}, {u'value': random.randint(1, 100), u'name':u'包头'}],
		[{u'name':u'北京'}, {u'value': random.randint(1, 100), u'name':u'北海'}],
		[{u'name':u'北京'}, {u'value': random.randint(1, 100), u'name':u'广州'}],
		[{u'name':u'北京'}, {u'value': random.randint(1, 100), u'name':u'郑州'}],
		[{u'name':u'北京'}, {u'value': random.randint(1, 100), u'name':u'长春'}],
		[{u'name':u'北京'}, {u'value': random.randint(1, 100), u'name':u'长治'}],
		[{u'name':u'北京'}, {u'value': random.randint(1, 100), u'name':u'重庆'}],
		[{u'name':u'北京'}, {u'value': random.randint(1, 100), u'name':u'长沙'}],
		[{u'name':u'北京'}, {u'value': random.randint(1, 100), u'name':u'成都'}],
		[{u'name':u'北京'}, {u'value': random.randint(1, 100), u'name':u'常州'}],
		[{u'name':u'北京'}, {u'value': random.randint(1, 100), u'name':u'丹东'}],
		[{u'name':u'北京'}, {u'value': random.randint(1, 100), u'name':u'大连'}],
		[{u'name':u'北京'}, {u'value': random.randint(1, 100), u'name':u'东营'}],
		[{u'name':u'北京'}, {u'value': random.randint(1, 100), u'name':u'延安'}],
		[{u'name':u'北京'}, {u'value': random.randint(1, 100), u'name':u'福州'}],
		[{u'name':u'北京'}, {u'value': random.randint(1, 100), u'name':u'海口'}],
		[{u'name':u'北京'}, {u'value': random.randint(1, 100), u'name':u'呼和浩特'}],
		[{u'name':u'北京'}, {u'value': random.randint(1, 100), u'name':u'合肥'}],
		[{u'name':u'北京'}, {u'value': random.randint(1, 100), u'name':u'杭州'}],
		[{u'name':u'北京'}, {u'value': random.randint(1, 100), u'name':u'哈尔滨'}],
		[{u'name':u'北京'}, {u'value': random.randint(1, 100), u'name':u'舟山'}],
		[{u'name':u'北京'}, {u'value': random.randint(1, 100), u'name':u'银川'}],
		[{u'name':u'北京'}, {u'value': random.randint(1, 100), u'name':u'衢州'}],
		[{u'name':u'北京'}, {u'value': random.randint(1, 100), u'name':u'南昌'}],
		[{u'name':u'北京'}, {u'value': random.randint(1, 100), u'name':u'昆明'}],
		[{u'name':u'北京'}, {u'value': random.randint(1, 100), u'name':u'贵阳'}],
		[{u'name':u'北京'}, {u'value': random.randint(1, 100), u'name':u'兰州'}],
		[{u'name':u'北京'}, {u'value': random.randint(1, 100), u'name':u'拉萨'}],
		[{u'name':u'北京'}, {u'value': random.randint(1, 100), u'name':u'连云港'}],
		[{u'name':u'北京'}, {u'value': random.randint(1, 100), u'name':u'临沂'}],
		[{u'name':u'北京'}, {u'value': random.randint(1, 100), u'name':u'柳州'}],
		[{u'name':u'北京'}, {u'value': random.randint(1, 100), u'name':u'宁波'}],
		[{u'name':u'北京'}, {u'value': random.randint(1, 100), u'name':u'南京'}],
		[{u'name':u'北京'}, {u'value': random.randint(1, 100), u'name':u'南宁'}],
		[{u'name':u'北京'}, {u'value': random.randint(1, 100), u'name':u'南通'}],
		[{u'name':u'北京'}, {u'value': random.randint(1, 100), u'name':u'上海'}],
		[{u'name':u'北京'}, {u'value': random.randint(1, 100), u'name':u'沈阳'}],
		[{u'name':u'北京'}, {u'value': random.randint(1, 100), u'name':u'西安'}],
		[{u'name':u'北京'}, {u'value': random.randint(1, 100), u'name':u'汕头'}],
		[{u'name':u'北京'}, {u'value': random.randint(1, 100), u'name':u'深圳'}],
		[{u'name':u'北京'}, {u'value': random.randint(1, 100), u'name':u'青岛'}],
		[{u'name':u'北京'}, {u'value': random.randint(1, 100), u'name':u'济南'}],
		[{u'name':u'北京'}, {u'value': random.randint(1, 100), u'name':u'太原'}],
		[{u'name':u'北京'}, {u'value': random.randint(1, 100), u'name':u'乌鲁木齐'}],
		[{u'name':u'北京'}, {u'value': random.randint(1, 100), u'name':u'潍坊'}],
		[{u'name':u'北京'}, {u'value': random.randint(1, 100), u'name':u'威海'}],
		[{u'name':u'北京'}, {u'value': random.randint(1, 100), u'name':u'温州'}],
		[{u'name':u'北京'}, {u'value': random.randint(1, 100), u'name':u'武汉'}],
		[{u'name':u'北京'}, {u'value': random.randint(1, 100), u'name':u'无锡'}],
		[{u'name':u'北京'}, {u'value': random.randint(1, 100), u'name':u'厦门'}],
		[{u'name':u'北京'}, {u'value': random.randint(1, 100), u'name':u'西宁'}],
		[{u'name':u'北京'}, {u'value': random.randint(1, 100), u'name':u'徐州'}],
		[{u'name':u'北京'}, {u'value': random.randint(1, 100), u'name':u'烟台'}],
		[{u'name':u'北京'}, {u'value': random.randint(1, 100), u'name':u'盐城'}],
		[{u'name':u'北京'}, {u'value': random.randint(1, 100), u'name':u'珠海'}],
		[{u'name':u'上海'}, {u'value': random.randint(1, 100), u'name':u'包头'}],
		[{u'name':u'上海'}, {u'value': random.randint(1, 100), u'name':u'北海'}],
		[{u'name':u'上海'}, {u'value': random.randint(1, 100), u'name':u'广州'}],
		[{u'name':u'上海'}, {u'value': random.randint(1, 100), u'name':u'郑州'}],
		[{u'name':u'上海'}, {u'value': random.randint(1, 100), u'name':u'长春'}],
		[{u'name':u'上海'}, {u'value': random.randint(1, 100), u'name':u'重庆'}],
		[{u'name':u'上海'}, {u'value': random.randint(1, 100), u'name':u'长沙'}],
		[{u'name':u'上海'}, {u'value': random.randint(1, 100), u'name':u'成都'}],
		[{u'name':u'上海'}, {u'value': random.randint(1, 100), u'name':u'丹东'}],
		[{u'name':u'上海'}, {u'value': random.randint(1, 100), u'name':u'大连'}],
		[{u'name':u'上海'}, {u'value': random.randint(1, 100), u'name':u'福州'}],
		[{u'name':u'上海'}, {u'value': random.randint(1, 100), u'name':u'海口'}],
		[{u'name':u'上海'}, {u'value': random.randint(1, 100), u'name':u'呼和浩特'}],
		[{u'name':u'上海'}, {u'value': random.randint(1, 100), u'name':u'合肥'}],
		[{u'name':u'上海'}, {u'value': random.randint(1, 100), u'name':u'哈尔滨'}],
		[{u'name':u'上海'}, {u'value': random.randint(1, 100), u'name':u'舟山'}],
		[{u'name':u'上海'}, {u'value': random.randint(1, 100), u'name':u'银川'}],
		[{u'name':u'上海'}, {u'value': random.randint(1, 100), u'name':u'南昌'}],
		[{u'name':u'上海'}, {u'value': random.randint(1, 100), u'name':u'昆明'}],
		[{u'name':u'上海'}, {u'value': random.randint(1, 100), u'name':u'贵阳'}],
		[{u'name':u'上海'}, {u'value': random.randint(1, 100), u'name':u'兰州'}],
		[{u'name':u'上海'}, {u'value': random.randint(1, 100), u'name':u'拉萨'}],
		[{u'name':u'上海'}, {u'value': random.randint(1, 100), u'name':u'连云港'}],
		[{u'name':u'上海'}, {u'value': random.randint(1, 100), u'name':u'临沂'}],
		[{u'name':u'上海'}, {u'value': random.randint(1, 100), u'name':u'柳州'}],
		[{u'name':u'上海'}, {u'value': random.randint(1, 100), u'name':u'宁波'}],
		[{u'name':u'上海'}, {u'value': random.randint(1, 100), u'name':u'南宁'}],
		[{u'name':u'上海'}, {u'value': random.randint(1, 100), u'name':u'北京'}],
		[{u'name':u'上海'}, {u'value': random.randint(1, 100), u'name':u'沈阳'}],
		[{u'name':u'上海'}, {u'value': random.randint(1, 100), u'name':u'秦皇岛'}],
		[{u'name':u'上海'}, {u'value': random.randint(1, 100), u'name':u'西安'}],
		[{u'name':u'上海'}, {u'value': random.randint(1, 100), u'name':u'石家庄'}],
		[{u'name':u'上海'}, {u'value': random.randint(1, 100), u'name':u'汕头'}],
		[{u'name':u'上海'}, {u'value': random.randint(1, 100), u'name':u'深圳'}],
		[{u'name':u'上海'}, {u'value': random.randint(1, 100), u'name':u'青岛'}],
		[{u'name':u'上海'}, {u'value': random.randint(1, 100), u'name':u'济南'}],
		[{u'name':u'上海'}, {u'value': random.randint(1, 100), u'name':u'天津'}],
		[{u'name':u'上海'}, {u'value': random.randint(1, 100), u'name':u'太原'}],
		[{u'name':u'上海'}, {u'value': random.randint(1, 100), u'name':u'乌鲁木齐'}],
		[{u'name':u'上海'}, {u'value': random.randint(1, 100), u'name':u'潍坊'}],
		[{u'name':u'上海'}, {u'value': random.randint(1, 100), u'name':u'威海'}],
		[{u'name':u'上海'}, {u'value': random.randint(1, 100), u'name':u'温州'}],
		[{u'name':u'上海'}, {u'value': random.randint(1, 100), u'name':u'武汉'}],
		[{u'name':u'上海'}, {u'value': random.randint(1, 100), u'name':u'厦门'}],
		[{u'name':u'上海'}, {u'value': random.randint(1, 100), u'name':u'西宁'}],
		[{u'name':u'上海'}, {u'value': random.randint(1, 100), u'name':u'徐州'}],
		[{u'name':u'上海'}, {u'value': random.randint(1, 100), u'name':u'烟台'}],
		[{u'name':u'上海'}, {u'value': random.randint(1, 100), u'name':u'珠海'}],
		[{u'name':u'广州'}, {u'value': random.randint(1, 100), u'name':u'北海'}],
		[{u'name':u'广州'}, {u'value': random.randint(1, 100), u'name':u'郑州'}],
		[{u'name':u'广州'}, {u'value': random.randint(1, 100), u'name':u'长春'}],
		[{u'name':u'广州'}, {u'value': random.randint(1, 100), u'name':u'重庆'}],
		[{u'name':u'广州'}, {u'value': random.randint(1, 100), u'name':u'长沙'}],
		[{u'name':u'广州'}, {u'value': random.randint(1, 100), u'name':u'成都'}],
		[{u'name':u'广州'}, {u'value': random.randint(1, 100), u'name':u'常州'}],
		[{u'name':u'广州'}, {u'value': random.randint(1, 100), u'name':u'大连'}],
		[{u'name':u'广州'}, {u'value': random.randint(1, 100), u'name':u'福州'}],
		[{u'name':u'广州'}, {u'value': random.randint(1, 100), u'name':u'海口'}],
		[{u'name':u'广州'}, {u'value': random.randint(1, 100), u'name':u'呼和浩特'}],
		[{u'name':u'广州'}, {u'value': random.randint(1, 100), u'name':u'合肥'}],
		[{u'name':u'广州'}, {u'value': random.randint(1, 100), u'name':u'杭州'}],
		[{u'name':u'广州'}, {u'value': random.randint(1, 100), u'name':u'哈尔滨'}],
		[{u'name':u'广州'}, {u'value': random.randint(1, 100), u'name':u'舟山'}],
		[{u'name':u'广州'}, {u'value': random.randint(1, 100), u'name':u'银川'}],
		[{u'name':u'广州'}, {u'value': random.randint(1, 100), u'name':u'南昌'}],
		[{u'name':u'广州'}, {u'value': random.randint(1, 100), u'name':u'昆明'}],
		[{u'name':u'广州'}, {u'value': random.randint(1, 100), u'name':u'贵阳'}],
		[{u'name':u'广州'}, {u'value': random.randint(1, 100), u'name':u'兰州'}],
		[{u'name':u'广州'}, {u'value': random.randint(1, 100), u'name':u'拉萨'}],
		[{u'name':u'广州'}, {u'value': random.randint(1, 100), u'name':u'连云港'}],
		[{u'name':u'广州'}, {u'value': random.randint(1, 100), u'name':u'临沂'}],
		[{u'name':u'广州'}, {u'value': random.randint(1, 100), u'name':u'柳州'}],
		[{u'name':u'广州'}, {u'value': random.randint(1, 100), u'name':u'宁波'}],
		[{u'name':u'广州'}, {u'value': random.randint(1, 100), u'name':u'南京'}],
		[{u'name':u'广州'}, {u'value': random.randint(1, 100), u'name':u'南宁'}],
		[{u'name':u'广州'}, {u'value': random.randint(1, 100), u'name':u'南通'}],
		[{u'name':u'广州'}, {u'value': random.randint(1, 100), u'name':u'北京'}],
		[{u'name':u'广州'}, {u'value': random.randint(1, 100), u'name':u'上海'}],
		[{u'name':u'广州'}, {u'value': random.randint(1, 100), u'name':u'沈阳'}],
		[{u'name':u'广州'}, {u'value': random.randint(1, 100), u'name':u'西安'}],
		[{u'name':u'广州'}, {u'value': random.randint(1, 100), u'name':u'石家庄'}],
		[{u'name':u'广州'}, {u'value': random.randint(1, 100), u'name':u'汕头'}],
		[{u'name':u'广州'}, {u'value': random.randint(1, 100), u'name':u'青岛'}],
		[{u'name':u'广州'}, {u'value': random.randint(1, 100), u'name':u'济南'}],
		[{u'name':u'广州'}, {u'value': random.randint(1, 100), u'name':u'天津'}],
		[{u'name':u'广州'}, {u'value': random.randint(1, 100), u'name':u'太原'}],
		[{u'name':u'广州'}, {u'value': random.randint(1, 100), u'name':u'乌鲁木齐'}],
		[{u'name':u'广州'}, {u'value': random.randint(1, 100), u'name':u'温州'}],
		[{u'name':u'广州'}, {u'value': random.randint(1, 100), u'name':u'武汉'}],
		[{u'name':u'广州'}, {u'value': random.randint(1, 100), u'name':u'无锡'}],
		[{u'name':u'广州'}, {u'value': random.randint(1, 100), u'name':u'厦门'}],
		[{u'name':u'广州'}, {u'value': random.randint(1, 100), u'name':u'西宁'}],
		[{u'name':u'广州'}, {u'value': random.randint(1, 100), u'name':u'徐州'}],
		[{u'name':u'广州'}, {u'value': random.randint(1, 100), u'name':u'烟台'}],
		[{u'name':u'广州'}, {u'value': random.randint(1, 100), u'name':u'盐城'}]
	]


