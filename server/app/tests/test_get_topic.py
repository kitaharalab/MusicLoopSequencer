from unittest import TestCase

import settings  # noqa: F401
from sqls import get_topic_id_ns

# cred = credentials.Certificate("app/credentials.json")
# firebase_app = firebase_admin.initialize_app(cred)

# app = Flask(__name__)
# CORS(app)
# cache.init_app(app)


class TestGetTopic(TestCase):
    def test_get_topic(self):
        print("test_get_topic")
        want_topic_id_ns = [
            {"id": 1, "number": 2},
            {"id": 2, "number": 2},
            {"id": 3, "number": 3},
            {"id": 4, "number": 3},
            {"id": 5, "number": 3},
            {"id": 6, "number": 4},
            {"id": 7, "number": 4},
            {"id": 8, "number": 4},
            {"id": 9, "number": 4},
        ]
        got_topic_id_ns = get_topic_id_ns()
        self.assertEqual(want_topic_id_ns, got_topic_id_ns)


if __name__ == "__main__":
    from unittest import main

    main()
