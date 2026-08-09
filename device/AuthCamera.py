from PyQt6.QtWidgets import QLabel
from PyQt6.QtCore import QTimer, Qt
from PyQt6.QtGui import QImage, QPixmap

import cv2


class AuthCamera(QLabel):

    def __init__(self, worker):

        super().__init__()


        self.worker = worker


        # Camera

        self.cap = cv2.VideoCapture(0)


        # Improve camera resolution

        self.cap.set(
            cv2.CAP_PROP_FRAME_WIDTH,
            640
        )

        self.cap.set(
            cv2.CAP_PROP_FRAME_HEIGHT,
            480
        )


        self.setAlignment(
            Qt.AlignmentFlag.AlignCenter
        )


        self.setStyleSheet(
            "background:black;"
        )


        # Timer for camera refresh

        self.timer = QTimer()

        self.timer.timeout.connect(
            self.update_frame
        )


        self.timer.start(
            30
        )


    # --------------------------------------------
    # Capture camera frame
    # --------------------------------------------

    def update_frame(self):

        ret, frame = self.cap.read()


        if not ret:
            return



        # Send frame to recognition thread

        self.worker.update_frame(
            frame
        )



        # Convert BGR -> RGB

        rgb = cv2.cvtColor(

            frame,

            cv2.COLOR_BGR2RGB

        )


        h, w, ch = rgb.shape


        bytes_per_line = (

            ch * w

        )


        image = QImage(

            rgb.data,

            w,

            h,

            bytes_per_line,

            QImage.Format.Format_RGB888

        )



        pixmap = QPixmap.fromImage(
            image
        )



        # Scale to widget size

        pixmap = pixmap.scaled(

            self.width(),

            self.height(),

            Qt.AspectRatioMode.KeepAspectRatio,

            Qt.TransformationMode.SmoothTransformation

        )


        self.setPixmap(
            pixmap
        )



    # --------------------------------------------
    # Release camera
    # --------------------------------------------

    def close_camera(self):

        self.timer.stop()


        if self.cap:

            self.cap.release()