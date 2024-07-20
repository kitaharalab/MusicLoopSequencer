from unittest import TestCase

import settings
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
            {"id": 10, "number": 3},
            {"id": 11, "number": 3},
            {"id": 12, "number": 3},
            {"id": 13, "number": 3},
            {"id": 14, "number": 3},
            {"id": 15, "number": 3},
            {"id": 16, "number": 3},
            {"id": 17, "number": 3},
            {"id": 18, "number": 3},
            {"id": 19, "number": 3},
            {"id": 20, "number": 3},
            {"id": 21, "number": 3},
            {"id": 22, "number": 3},
            {"id": 23, "number": 3},
            {"id": 24, "number": 3},
        ]
        got_topic_id_ns = get_topic_id_ns()
        self.assertEqual(want_topic_id_ns, got_topic_id_ns)


if __name__ == "__main__":
    from unittest import main

    main()
