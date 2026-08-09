from PyQt6.QtCore import QThread, pyqtSignal
import time


class FaceWorker(QThread):

    # sends recognition result to UI
    result_signal = pyqtSignal(dict)

    def __init__(self, engine, database):

        super().__init__()

        self.engine = engine

        self.database = database

        self.frame = None

        self.running = True

        # starts paused: nothing to recognize against until the app's
        # first schedule poll finds an open sitting and loads its roster
        self.processing = False

        self.cooldown = False

    # -------------------------------------------------
    # Receive frame from camera
    # -------------------------------------------------
    def update_frame(self, frame):

        self.frame = frame

    # -------------------------------------------------
    # Called by FaceApp once a session's authentication window opens
    # and its roster has been loaded
    # -------------------------------------------------
    def resume(self):

        self.processing = True

    # -------------------------------------------------
    # Called by FaceApp when no session's window is currently open
    # (between sittings, or the day is done)
    # -------------------------------------------------
    def pause(self):

        self.processing = False

    # -------------------------------------------------
    # Stop worker entirely (app closing)
    # -------------------------------------------------
    def stop(self):

        self.running = False

    # -------------------------------------------------
    # Recognition loop
    # -------------------------------------------------
    def run(self):

        while self.running:

            if not self.processing:

                self.msleep(150)

                continue

            if self.frame is None:

                self.msleep(30)

                continue

            if self.cooldown:

                self.msleep(100)

                continue

            # Important:
            # copy frame because camera changes it
            frame = self.frame.copy()

            students = self.database.get_students()

            if len(students) == 0:

                self.result_signal.emit({

                    "status": "NO_DATABASE"

                })

                self.msleep(500)

                continue

            # run recognition

            result = self.engine.recognize(

                frame,

                students

            )

            self.result_signal.emit(result)

            # ------------------------------------------
            # Cooldown after recognition
            # ------------------------------------------

            if result["status"] == "SUCCESS":

                self.cooldown = True

                time.sleep(2)

                self.cooldown = False

            elif result["status"] == "FAILED":

                self.cooldown = True

                time.sleep(2)

                self.cooldown = False

            # Recognition speed
            # 4 scans per second

            self.msleep(250)
