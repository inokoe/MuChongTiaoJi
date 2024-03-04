import hashlib

import requests
from fake_http_header import FakeHttpHeader

requests.adapters.DEFAULT_RETRIES = 5


def user_agent():
    fake_header = FakeHttpHeader(domain_name='us').as_header_dict()
    fake_header['Accept-language'] = 'zh'
    fake_header['Referer'] = 'http://muchong.com/f-430-1-typeid-2304'
    return fake_header


def md5(value):
    m = hashlib.md5()
    m.update(value)
    return m.hexdigest()


def get_data():
    index_url = 'http://muchong.com/f-430-1'
    try:
        response = requests.get(index_url, headers=user_agent(), timeout=15)
        return response
    except requests.exceptions.RequestException as e:
        return None


# 当txt文件中的md5值数量，超过限制后进行清除
def check_data_size(data):
    if data.count(',') > 260000:
        return 'start,'
    return data


if __name__ == '__main__':
    print(user_agent())
    # 解决GBK乱码：
    # 方法一 指定GBK
    # print(get_data().content.decode('gbk', 'ignore'))
    # 方法二：使用text让其自动解码
    print(get_data().text)
