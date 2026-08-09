from PyQt6.QtCore import QThread, pyqtSignal
import requests


class ScheduleWorker(QThread):
    """
    Fetches the device's schedule for today: every exam sitting at its
    venue, each already tagged upcoming / open / closed by the backend
    based on the admin-configurable authentication window (AuthConfig).
    One-shot — FaceApp spins up a fresh instance on every poll tick,
    the same pattern the old ApiWorker used.
    """

    finished = pyqtSignal(dict)

    def __init__(self, api_base_url, api_key):
        super().__init__()

        self.api_base_url = api_base_url
        self.api_key = api_key

    def run(self):

        try:

            response = requests.get(
                f"{self.api_base_url}/device/schedule/",
                headers={"X-Device-Key": self.api_key},
                timeout=15
            )

            response.raise_for_status()

            self.finished.emit(response.json())

        except Exception as e:

            print()
            print("=============================")
            print("Unable to fetch schedule.")
            print(e)
            print("=============================")

            self.finished.emit({})


class RosterWorker(QThread):
    """
    Fetches the roster — students + embeddings — for ONE exam sitting,
    identified by its exam_timetable_id. Only ever pulls the students
    eligible for that specific sitting, never the whole student body.
    """

    finished = pyqtSignal(list)

    def __init__(self, api_base_url, api_key, exam_timetable_id):
        super().__init__()

        self.api_base_url = api_base_url
        self.api_key = api_key
        self.exam_timetable_id = exam_timetable_id

    def run(self):

        try:

            response = requests.get(
                f"{self.api_base_url}/exam-timetables/"
                f"{self.exam_timetable_id}/roster/",
                headers={"X-Device-Key": self.api_key},
                timeout=20
            )

            response.raise_for_status()

            data = response.json()

            students = []

            for item in data.get("roster", []):

                students.append({

                    "student_id":
                        item["student_id"],

                    "registration_number":
                        item["registration_number"],

                    "name":
                        item["student_name"],

                    "embedding":
                        item["embedding"]

                })

            self.finished.emit(students)

        except Exception as e:

            print()
            print("=============================")
            print("Unable to download roster.")
            print(e)
            print("=============================")

            self.finished.emit([])
