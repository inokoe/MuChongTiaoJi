import hashlib
import time
from my_fake_useragent import UserAgent
import telebot
import requests
from bs4 import BeautifulSoup
import os

ua = UserAgent(family='safari')
headers = {
    'User-Agent': ua.random(),
    'referer': 'http://muchong.com/f-430-1-typeid-2304'
}


def get_data():
    index_url = 'http://muchong.com/f-430-1'
    try:
        response = requests.get(index_url, timeout=5)
        return response
    except requests.exceptions.RequestException as e:
        time.sleep(2)
        get_data()
        return get_data()


def md5(value):
    m = hashlib.md5()
    m.update(value)
    return m.hexdigest()


# 当txt文件中的md5值数量，超过限制后进行清除
def check_data_size(data):
    if data.count(',') > 260000:
        return 'start,'
    return data


# Set TG bot

chat_id = "@muchongtiaoji"  # 频道地址
token = os.environ["token"]  # 机器人 TOKEN
bot = telebot.TeleBot(token)

f = open('MuchongSaved.txt', 'r', encoding='utf-8')
old_data = f.read()
f.close()

old_data = check_data_size(old_data)

res = get_data()
soup = BeautifulSoup(res.content, 'html.parser')
soup = soup.findAll(name='a', attrs={"class": "a_subject"})
sub_url = 'http://muchong.com/'
for x in soup:
    url = sub_url + x['href']
    content = ''
    # 当某条信息未被抓取时，组装HTML用于发送到telegram channel
    if old_data.find(md5(str(url).encode('utf-8'))) == -1:
        old_data += md5(str(url).encode('utf-8')) + ','
        content = "<a href='"
        content += url
        content += "'>"
        content += x.text.replace('<', '').replace('>', '')
        content += "</a>"
        print(content)
        flag = 1
        timer = 0
        try:
            bot.send_message(chat_id=chat_id, text=content, parse_mode='HTML')
        except:
            print('Try transfer data to telegram channel but failure.')

f = open('MuchongSaved.txt', 'w', encoding='utf-8')
f.write(old_data)
f.close()
