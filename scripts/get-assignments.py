import requests
import sys
import math
from bs4 import BeautifulSoup
import json


def round_up_to_nearest_5(num):
    return math.ceil(num / 5) * 5


# Settings
mycourseville_site = "https://www.mycourseville.com/"
cookie = sys.argv[1]

course_id = sys.argv[2]

data = requests.get(mycourseville_site + "?q=courseville/course/" + str(course_id) + "/assignment",
                    headers={"Cookie": cookie})
soup = BeautifulSoup(data.text, 'html.parser')

hasAssignment = "no assignments" not in soup.find(
    "section", {"id": "courseville-assignment-list"}).text.strip().lower()

if hasAssignment:
    assignments_list = soup.find(
        "section", {"id": "courseville-assignment-list"}).find_all("tr")

    total_assignments = None

    show_all = False if soup.find(
        "div", {"id": "courseville-assignment-list-all-shown-notice"})['style'] == "display:none" else True

    if show_all:
        total_assignments = len(assignments_list)
    else:
        loadmore_msg = soup.find(
            "span", {"id": "courseville-assignment-list-loadmore-msg"}).text
        total_assignments = int(loadmore_msg.partition(
            'from ')[-1].partition(' ')[0])
        loaded_assignments = int(loadmore_msg.partition(
            'Showing ')[-1].partition(' ')[0])

        for i in range(int(round_up_to_nearest_5(total_assignments - loaded_assignments) / 5)):
            loadmore = requests.post(mycourseville_site + "?q=courseville/ajax/loadmoreassignmentrows", data={"cv_cid": course_id, "next": (i+1)*5},
                                     headers={"Cookie": cookie})
            loadmore_json = loadmore.json()
            if loadmore_json['status'] == 0:
                print("Error: Session expired")
            else:
                loadmore_soup = BeautifulSoup(loadmore_json['data']
                                              ['html'], 'html.parser')
                assignments_list += loadmore_soup.find_all("tr")

    assignments = []

    for assignment in assignments_list:
        assignment_table_data = assignment.find_all("td")

        assignment_name = assignment.find("a").text
        assignment_img = assignment.find("img")["src"]
        assignment_url = assignment.find(
            "a", {"title": "Make/Edit your submission"})["href"]
        assignment_post_date = assignment_table_data[2].find_all(
            "div")[-1].text.replace("Out on ", "")
        assignment_due_date = assignment_table_data[3].find_all(
            "div")[-1].text.replace("Due on ", "")
        assignment_status = assignment_table_data[5].text.strip()

        assignment_data = {
            "name": assignment_name,
            "img": mycourseville_site + assignment_img,
            "url": mycourseville_site + assignment_url,
            "post_date": assignment_post_date,
            "due_date": assignment_due_date,
            "status": assignment_status
        }
        assignments.append(assignment_data)

    print(assignments)
else:
    print([])
