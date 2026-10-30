import unittest

from ml.labels import CLASSES, folder_to_class
from ml.metrics import accuracy, confusion_matrix, expected_calibration_error, per_class, summarise


class LabelTests(unittest.TestCase):
    def test_common_layouts(self):
        cases = {
            "glioma": 1, "meningioma": 1, "pituitary": 1, "notumor": 2, "NonDemented": 2,
            "VeryMildDemented": 0, "MildDemented": 0, "ModerateDemented": 0, "Brain Tumor": 1, "Normal": 2,
        }
        for name, idx in cases.items():
            self.assertEqual(folder_to_class(name), idx, name)

    def test_unknown_and_override(self):
        with self.assertRaises(ValueError):
            folder_to_class("mystery")
        self.assertEqual(folder_to_class("mystery", {"mystery": 2}), 2)

    def test_class_order_matches_agents(self):
        from app.agents import CLASSES as AGENT_CLASSES
        self.assertEqual(CLASSES, AGENT_CLASSES)


class MetricTests(unittest.TestCase):
    def test_confusion_and_rates(self):
        y_true = [0, 0, 1, 1, 2, 2]
        y_pred = [0, 1, 1, 1, 2, 0]
        cm = confusion_matrix(y_true, y_pred, 3)
        self.assertEqual(cm, [[1, 1, 0], [0, 2, 0], [1, 0, 1]])
        self.assertAlmostEqual(accuracy(cm), 4 / 6)
        rows = per_class(cm, ["a", "b", "c"])
        self.assertAlmostEqual(rows[1]["precision"], 2 / 3)
        self.assertAlmostEqual(rows[1]["recall"], 1.0)

    def test_ece_perfect_and_overconfident(self):
        perfect = [[1.0, 0.0], [0.0, 1.0]]
        self.assertAlmostEqual(expected_calibration_error(perfect, [0, 1]), 0.0)
        overconfident = [[0.99, 0.01]] * 4
        self.assertGreater(expected_calibration_error(overconfident, [0, 1, 1, 1]), 0.5)

    def test_summary_shape(self):
        s = summarise([0, 1, 2], [[0.8, 0.1, 0.1], [0.1, 0.8, 0.1], [0.1, 0.1, 0.8]], CLASSES)
        self.assertEqual(s["accuracy"], 1.0)
        self.assertEqual(len(s["perClass"]), 3)
        self.assertEqual(s["confusion"]["labels"], CLASSES)


if __name__ == "__main__":
    unittest.main()
