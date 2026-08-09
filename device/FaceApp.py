import sys

from PyQt6.QtWidgets import (
    QApplication,
    QWidget,
    QVBoxLayout,
    QGridLayout,
)

from PyQt6.QtCore import QTimer


from face_engine import FaceEngine
from StudentDatabase import StudentDatabase
from ApiWorkers import ScheduleWorker, RosterWorker
from FaceWorker import FaceWorker
from AuthCamera import AuthCamera
from OverlayWidget import OverlayWidget
from SessionInfoBar import SessionInfoBar
from device_config import load_config


class MainWindow(QWidget):

    def __init__(self):

        super().__init__()


        self.setWindowTitle(
            "Student Exam Authentication"
        )


        self.setFixedSize(
            400,
            678
        )


        # -----------------------------------------
        # Device identity / API config
        #
        # device_config.json holds this device's api_base_url and
        # api_key (from the admin dashboard's Devices page) plus how
        # often to poll the schedule.
        # -----------------------------------------

        self.config = load_config()



        # -----------------------------------------
        # Database
        # -----------------------------------------

        self.database = StudentDatabase()



        # -----------------------------------------
        # Face engine
        # -----------------------------------------

        self.engine = FaceEngine(
            tolerance=0.50
        )



        # -----------------------------------------
        # Worker
        # -----------------------------------------

        self.worker = FaceWorker(

            self.engine,

            self.database

        )


        self.worker.result_signal.connect(
            self.face_result
        )



        # -----------------------------------------
        # Camera
        # -----------------------------------------

        self.camera = AuthCamera(
            self.worker
        )



        # -----------------------------------------
        # Overlay
        # -----------------------------------------

        self.overlay = OverlayWidget()



        # -----------------------------------------
        # Session info bar (course, exam time, roster
        # count, live clock)
        # -----------------------------------------

        self.info_bar = SessionInfoBar()



        # -----------------------------------------
        # Stack camera + overlay
        # -----------------------------------------

        camera_container = QWidget()


        grid = QGridLayout()


        grid.setContentsMargins(
            0,
            0,
            0,
            0
        )


        grid.addWidget(
            self.camera,
            0,
            0
        )


        grid.addWidget(
            self.overlay,
            0,
            0
        )


        camera_container.setLayout(
            grid
        )



        # -----------------------------------------
        # Main layout: info bar on top, camera below
        # -----------------------------------------

        layout = QVBoxLayout()


        layout.setContentsMargins(
            0,
            0,
            0,
            0
        )


        layout.setSpacing(
            0
        )


        layout.addWidget(
            self.info_bar
        )


        layout.addWidget(
            camera_container
        )


        self.setLayout(
            layout
        )



        # -----------------------------------------
        # Which sitting (exam_timetable_id) is
        # currently loaded, if any
        # -----------------------------------------

        self.current_timetable_id = None

        self.pending_entry = None


        # nothing loaded yet - don't recognize until the first
        # schedule poll finds an open sitting

        self.worker.pause()

        self.overlay.show_waiting(
            "Checking today's schedule..."
        )



        # -----------------------------------------
        # Schedule polling
        # -----------------------------------------

        self.schedule_timer = QTimer()

        self.schedule_timer.timeout.connect(
            self.poll_schedule
        )

        poll_ms = self.config.get(
            "schedule_poll_seconds",
            20
        ) * 1000

        self.schedule_timer.start(
            poll_ms
        )


        # check immediately on startup instead of waiting a full
        # interval for the first poll

        self.poll_schedule()


        self.worker.start()



    # =================================================
    # Poll the day's schedule
    # =================================================

    def poll_schedule(self):

        self.schedule_worker = ScheduleWorker(

            self.config["api_base_url"],

            self.config["api_key"]

        )


        self.schedule_worker.finished.connect(
            self.schedule_received
        )


        self.schedule_worker.start()


    def schedule_received(self, data):

        schedule = data.get(
            "schedule",
            []
        )


        open_entry = None

        next_entry = None


        for entry in schedule:

            if entry["status"] == "open":

                open_entry = entry

                break


            if entry["status"] == "upcoming" and next_entry is None:

                next_entry = entry



        if open_entry:


            if open_entry["exam_timetable_id"] != self.current_timetable_id:

                # a new sitting just opened - load its roster

                self.load_roster(
                    open_entry
                )

            else:

                # same sitting still open, just refresh the display

                self.info_bar.show_open_session(

                    open_entry["course_code"],

                    open_entry["course_title"],

                    open_entry["session_start"],

                    open_entry["session_end"],

                    self.database.count()

                )


        else:


            if self.current_timetable_id is not None:

                # the window we were authenticating for just closed

                self.database.clear()

                self.worker.pause()

                self.current_timetable_id = None

                self.overlay.show_waiting(

                    "Session closed. Waiting for the next exam..."

                )


            self.info_bar.show_waiting(
                next_entry
            )



    # =================================================
    # Load the roster for the currently open sitting
    # =================================================

    def load_roster(self, entry):

        self.overlay.show_waiting(

            f"Loading roster for {entry['course_code']}..."

        )


        self.pending_entry = entry


        self.roster_worker = RosterWorker(

            self.config["api_base_url"],

            self.config["api_key"],

            entry["exam_timetable_id"]

        )


        self.roster_worker.finished.connect(
            self.roster_loaded
        )


        self.roster_worker.start()



    def roster_loaded(self, students):

        entry = self.pending_entry


        if len(students) == 0:

            self.overlay.show_error()

            return


        self.database.load(
            students
        )


        self.current_timetable_id = entry["exam_timetable_id"]


        print(

            f"Roster loaded for {entry['course_code']}:",

            self.database.count(),

            "students"

        )


        self.overlay.hide()


        self.info_bar.show_open_session(

            entry["course_code"],

            entry["course_title"],

            entry["session_start"],

            entry["session_end"],

            self.database.count()

        )


        self.worker.resume()



    # =================================================
    # Recognition result
    # =================================================

    def face_result(self, result):


        status = result["status"]



        if status == "NO_FACE":


            self.overlay.show_scanning()



        elif status == "SUCCESS":


            student = result["student"]


            print(
                "Authenticated:",
                student["name"]
            )


            self.overlay.show_success(
                student
            )



        elif status == "FAILED":


            print(
                "Access denied"
            )


            self.overlay.show_failed()



        elif status == "NO_DATABASE":


            self.overlay.show_error()




    # =================================================
    # Close application
    # =================================================

    def closeEvent(self, event):


        self.schedule_timer.stop()


        self.worker.stop()


        self.camera.close_camera()


        self.worker.wait()


        event.accept()





if __name__ == "__main__":


    app = QApplication(sys.argv)


    window = MainWindow()


    window.show()


    sys.exit(
        app.exec()
    )
