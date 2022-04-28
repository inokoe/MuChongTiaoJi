cd /home/wu/Private-action-script
git pull
python3 /home/wu/Private-action-script/nhentai_set.py
/usr/local/bin/nhentai  --file=manga.txt  --threads=5
python3 /home/wu/Private-action-script/nhentai_bot.py
git add .
git commit -m 'auto'
git push