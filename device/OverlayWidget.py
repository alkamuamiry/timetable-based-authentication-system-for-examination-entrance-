from PyQt6.QtWidgets import (
    QWidget,
    QLabel,
    QVBoxLayout,
    QFrame,
    QGraphicsDropShadowEffect
)
from PyQt6.QtCore import Qt, QTimer, QUrl, QSize
from PyQt6.QtGui import QMovie, QFont, QColor
from PyQt6.QtMultimedia import QSoundEffect


class OverlayWidget(QWidget):
    """
    Displays scanning / success / failed / error states on top of the
    camera feed.

    - "Scanning" shows ONLY the (already-transparent) scanning GIF and
      a plain text label directly over the face - no card, no dark
      background box. The GIF's own transparency is what lets the
      camera feed show through.
    - "Success" / "Failed" / "Error" use a solid centered card since
      they only show briefly (2 seconds) as a clear confirmation.

    Note: at most one QGraphicsEffect is ever painted at the same time
    (drop shadow on the card OR the text shadow on the scan label, and
    never both together, since the two states are mutually exclusive).
    Stacking two animated effects that paint simultaneously is what
    caused earlier "QPainter::begin: A paint device can only be
    painted by one painter at a time" errors - keep it this way.
    """

    def __init__(self, parent=None):

        super().__init__(parent)

        self.setAttribute(
            Qt.WidgetAttribute.WA_TransparentForMouseEvents
        )

        self.setStyleSheet(
            "background: transparent;"
        )

        # =====================================================
        # Outer layout - centers everything on the camera feed
        # =====================================================

        outer_layout = QVBoxLayout()

        outer_layout.setAlignment(
            Qt.AlignmentFlag.AlignCenter
        )

        outer_layout.setSpacing(6)

        self.setLayout(outer_layout)

        # =====================================================
        # Scanning display - GIF + text only, no background box
        # =====================================================

        self.scan_gif_label = QLabel()

        self.scan_gif_label.setAlignment(
            Qt.AlignmentFlag.AlignCenter
        )

        self.scan_gif_label.setFixedSize(
            QSize(220, 220)
        )

        self.scan_gif_label.setStyleSheet(
            "background: transparent;"
        )

        self.scan_gif_label.hide()

        outer_layout.addWidget(
            self.scan_gif_label,
            alignment=Qt.AlignmentFlag.AlignCenter
        )

        self.scan_text = QLabel()

        self.scan_text.setAlignment(
            Qt.AlignmentFlag.AlignCenter
        )

        self.scan_text.setFont(
            QFont("Segoe UI", 14, QFont.Weight.Bold)
        )

        self.scan_text.setStyleSheet(
            "background: transparent; color: #4da6ff;"
        )

        # Drop shadow behind the text so it stays readable
        # against a bright or busy camera background.

        text_shadow = QGraphicsDropShadowEffect()

        text_shadow.setBlurRadius(10)

        text_shadow.setOffset(0, 1)

        text_shadow.setColor(QColor(0, 0, 0, 220))

        self.scan_text.setGraphicsEffect(text_shadow)

        self.scan_text.hide()

        outer_layout.addWidget(
            self.scan_text,
            alignment=Qt.AlignmentFlag.AlignCenter
        )

        # =====================================================
        # Card - the rounded panel for success / failed / error
        # =====================================================

        self.card = QFrame()

        self.card.setObjectName("card")

        self.card.setFixedWidth(300)

        self.card.setMinimumHeight(220)

        card_layout = QVBoxLayout()

        card_layout.setContentsMargins(24, 24, 24, 24)

        card_layout.setSpacing(10)

        card_layout.setAlignment(
            Qt.AlignmentFlag.AlignCenter
        )

        self.card.setLayout(card_layout)

        card_shadow = QGraphicsDropShadowEffect()

        card_shadow.setBlurRadius(30)

        card_shadow.setOffset(0, 6)

        card_shadow.setColor(QColor(0, 0, 0, 160))

        self.card.setGraphicsEffect(card_shadow)

        self.card.hide()

        outer_layout.addWidget(
            self.card,
            alignment=Qt.AlignmentFlag.AlignCenter
        )

        # =====================================================
        # GIF / icon area (inside the card, result states only)
        # =====================================================

        self.gif_label = QLabel()

        self.gif_label.setAlignment(
            Qt.AlignmentFlag.AlignCenter
        )

        self.gif_label.setFixedHeight(90)

        card_layout.addWidget(self.gif_label)

        # =====================================================
        # Message (inside the card)
        # =====================================================

        self.message = QLabel()

        self.message.setAlignment(
            Qt.AlignmentFlag.AlignCenter
        )

        self.message.setFont(
            QFont("Segoe UI", 18, QFont.Weight.Bold)
        )

        card_layout.addWidget(self.message)

        # =====================================================
        # Student name / subtitle (inside the card)
        # =====================================================

        self.student = QLabel()

        self.student.setAlignment(
            Qt.AlignmentFlag.AlignCenter
        )

        self.student.setFont(
            QFont("Segoe UI", 12)
        )

        self.student.setWordWrap(True)

        card_layout.addWidget(self.student)

        self.card_movie = None

        self.scan_movie = None

        # =====================================================
        # Sound effects
        #
        # QSoundEffect needs uncompressed audio (.wav). Place your
        # own files at:
        #   assets/success.wav
        #   assets/failed.wav
        # =====================================================

        self.success_sound = QSoundEffect()

        self.success_sound.setSource(
            QUrl.fromLocalFile("assets/success.wav")
        )

        self.success_sound.setVolume(0.9)

        self.fail_sound = QSoundEffect()

        self.fail_sound.setSource(
            QUrl.fromLocalFile("assets/failed.wav")
        )

        self.fail_sound.setVolume(0.9)

        self.hide()

    # =========================================================
    # Card styling per result state
    # =========================================================

    def _set_card_style(self, accent):

        self.card.setStyleSheet(f"""
            QFrame#card {{
                background-color: rgba(20, 20, 25, 235);
                border: 2px solid {accent};
                border-radius: 20px;
            }}
        """)

        self.message.setStyleSheet(
            f"color: {accent};"
        )

        self.student.setStyleSheet(
            "color: #e6e6e6;"
        )

    # --------------------------------------------------
    # Show scanning - just the GIF + text, straight over the
    # face, no card / no background box.
    # --------------------------------------------------

    def show_scanning(self):

        self.show()

        self.card.hide()

        self.scan_text.setText(
            "SCANNING..."
        )

        self.play_scan_gif(
            "assets/scanning.gif"
        )

        self.scan_gif_label.show()

        self.scan_text.show()

    # --------------------------------------------------
    # Success - full card, brief
    # --------------------------------------------------

    def show_success(self, student):

        self.show()

        self.scan_gif_label.hide()

        self.scan_text.hide()

        self.card.show()

        self._set_card_style("#2ecc71")  # green

        self.message.setText(
            "✅ ACCESS GRANTED"
        )

        self.student.setText(
            student["name"]
            + "\n"
            + student["registration_number"]
        )

        self.play_card_gif(
            "assets/success.gif"
        )

        self.success_sound.play()

        QTimer.singleShot(
            2000,
            self._end_result
        )

    # --------------------------------------------------
    # Failed - full card, brief
    # --------------------------------------------------

    def show_failed(self):

        self.show()

        self.scan_gif_label.hide()

        self.scan_text.hide()

        self.card.show()

        self._set_card_style("#e74c3c")  # red

        self.message.setText(
            "❌ ACCESS DENIED"
        )

        self.student.clear()

        self.play_card_gif(
            "assets/failed.gif"
        )

        self.fail_sound.play()

        QTimer.singleShot(
            2000,
            self._end_result
        )

    # --------------------------------------------------
    # No database / error - full card, stays until resolved
    # --------------------------------------------------

    def show_error(self):

        self.show()

        self.scan_gif_label.hide()

        self.scan_text.hide()

        self.card.show()

        self._set_card_style("#f39c12")  # amber

        self.message.setText(
            "⚠ DATABASE ERROR"
        )

        self.student.clear()

    # --------------------------------------------------
    # Waiting between sessions - full card, informational
    # (blue, not an error), stays until the next session's
    # roster loads or a new result comes in.
    # --------------------------------------------------

    def show_waiting(self, message):

        self.show()

        self.scan_gif_label.hide()

        self.scan_text.hide()

        self.card.show()

        self._set_card_style("#4da6ff")  # blue

        self.message.setText(
            "⏳ WAITING"
        )

        self.student.setText(
            message
        )

    # --------------------------------------------------
    # After a success/failed card times out, hide the card.
    # The next "scanning" result (from FaceWorker's loop) will
    # bring the GIF + text back.
    # --------------------------------------------------

    def _end_result(self):

        self.card.hide()

        self.hide()

    # --------------------------------------------------
    # Play the small transparent GIF used during scanning
    # --------------------------------------------------

    def play_scan_gif(self, path):

        if self.scan_movie:

            self.scan_movie.stop()

        self.scan_movie = QMovie(path)

        self.scan_gif_label.setMovie(self.scan_movie)

        self.scan_movie.start()

    # --------------------------------------------------
    # Play the GIF inside the result card
    # --------------------------------------------------

    def play_card_gif(self, path):

        if self.card_movie:

            self.card_movie.stop()

        self.card_movie = QMovie(path)

        self.gif_label.setMovie(self.card_movie)

        self.card_movie.start()