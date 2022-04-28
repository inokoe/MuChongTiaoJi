import hashlib
import time
from my_fake_useragent import UserAgent
import telebot
import requests
from bs4 import BeautifulSoup

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


def check_data_size(data):
    if data.count(',') > 260000:
        return 'start,'
    return data


# Set TG bot
chat_id = "@muchongtiaoji"  # 频道地址
token = "5309926080:AAFpffXscobEyGqE6IvUYUqA3fs_lnQP4w8"  # 机器人 TOKEN
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
    # if x.text.find('水产')>-1 or x.text.find('凝固')>-1 or x.text.find('经济学')>-1 or x.text.find('化工')>-1 or x.text.find('石油')>-1 or x.text.find('天然气')>-1 or x.text.find('力学')>-1 or x.text.find('韩国')>-1 or x.text.find('香港')>-1 or x.text.find('科学')>-1 or x.text.find('生命')>-1 or x.text.find('环境')>-1 or x.text.find('生态')>-1 or x.text.find('中药')>-1 or x.text.find('遗传')>-1 or x.text.find('西京')>-1 or x.text.find('土木')>-1 or x.text.find('轻工技术')>-1 or x.text.find('工商管理')>-1 or x.text.find('纤维')>-1 or x.text.find('纳米')>-1 or x.text.find('生物')>-1 or x.text.find('化学')>-1 or x.text.find('材料')>-1 or x.text.find('细胞')>-1 or x.text.find('农学')>-1 or x.text.find('物理')>-1 :
    #     old_data += md5(str(url).encode('utf-8'))+','
    #     print('！！排除！！')
    #     continue
    content = ''
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
        while flag:
            timer += 1
            try:
                bot.send_message(chat_id=chat_id, text=content, parse_mode='HTML')
                break
            except:
                print('this one failure , try sleep')
                time.sleep(60*timer)
            if timer > 4:
                flag = 0
    else:
        print('!!  Repeat  !!')

f = open('MuchongSaved.txt', 'w', encoding='utf-8')
f.write(old_data)
f.close()
