import json
import sys
from bs4 import BeautifulSoup
import requests

# Settings
mycourseville_site = "https://www.mycourseville.com/"
cookie = sys.argv[1]

data = requests.get(mycourseville_site,
                    headers={"Cookie": cookie})
soup = BeautifulSoup(data.text, 'html.parser')

course_list = soup.find_all("a", {"class": "courseville-courseicon"})
courses = []

for course in course_list:
    course_id = course.find("div", {"data-part": "courseno"}).text
    course_title = course.find("div", {"data-part": "title"}).text
    course_image_raw = course.find(
        "img", {"class": "courseville-courseicon-icon-img"})['src']
    course_image = course_image_raw if mycourseville_site in course_image_raw else mycourseville_site + course_image_raw
    course_data = {
        "id": course_id,
        "title": course_title,
        "image": course_image,
        "url": mycourseville_site + course['href']
    }
    courses.append(course_data)

print(courses)
