import os

import telebot
from bs4 import BeautifulSoup

from Utils import get_data, check_data_size, md5

# Set TG bot
chat_id = "@muchongtiaoji"  # 频道地址
token = os.environ["token"]  # 机器人 TOKEN
bot = telebot.TeleBot(token)

# 读取历史已发布的内容
f = open('MuchongSaved.txt', 'r', encoding='utf-8')
old_data = f.read()
f.close()

# 检查数据大小，超过260000则清零
old_data = check_data_size(old_data)

# 获取网页内容
res = get_data()
if res is None:
    exit(0)

# 使用Soup进行内容提取
soup = BeautifulSoup(res.text, 'html.parser')
soup = soup.findAll(name='a', attrs={"class": "a_subject"})
sub_url = 'http://muchong.com/'

for x in soup:
    url = sub_url + x['href']
    content = ''
    # 当某条信息未被抓取时，组装HTML用于发送到telegram channel
    if old_data.find(md5(str(url).encode('utf-8'))) == -1:
        old_data += md5(str(url).encode('utf-8')) + ','
        content = f"<a href='{url}'>{x.text.replace('<', '').replace('>', '')}</a>"
        print(content)
        try:
            bot.send_message(chat_id=chat_id, text=content, parse_mode='HTML')
        except:
            print('Try transfer data to telegram channel but failure.')

f = open('MuchongSaved.txt', 'w', encoding='utf-8')
f.write(old_data)
f.close()
