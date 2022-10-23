import requests
import sys
from bs4 import BeautifulSoup

req_session = requests.Session()

data = req_session.get(
    'https://www.mycourseville.com/api/oauth/authorize?response_type=code&client_id=mycourseville.com&redirect_uri=https://www.mycourseville.com&login_page=itchula')
soup = BeautifulSoup(data.text, 'html.parser')
form_token = soup.find('input', {'name': '_token'})['value']

cuLogin = req_session.post("https://www.mycourseville.com/api/login", data={
    '_token': form_token,
    'loginfield': 'name',
    'name': sys.argv[1],
    'password': sys.argv[2]
})

cookie = cuLogin.headers['Set-Cookie'].split(';')[0]

scrap = BeautifulSoup(cuLogin.text, 'html.parser')
name_scrap = scrap.find(
    "div", {"class": "courseville-fbpict-sider"}).text.strip().split(" ")
name = name_scrap[-2] + " " + name_scrap[-1]
print(name + ", " + cookie)
