import pprint as pp
from unittest import TestCase

import settings  # noqa: F401
from psycopg2.errors import UniqueViolation
from route.projects.songs.choose_sound import (
    choose_sound_randomly,
    choose_sound_randomly_with_using_ratio_topic,
    get_part_loop_values,
)
from sqls import get_parts
from util.const import part_name2index


def init0(topic_n_preferences_by_part_measure_topic):
    for (
        part,
        topic_n_preferences_by_measure_topic,
    ) in topic_n_preferences_by_part_measure_topic.items():
        for (
            measure,
            topic_n_preferences_by_topic,
        ) in topic_n_preferences_by_measure_topic.items():
            for topic_id, preference in topic_n_preferences_by_topic.items():
                # print(topic_id, preference)
                topic_n_preferences_by_part_measure_topic[part][measure][topic_id] = 0


def init1(topic_n_preferences_by_part_measure_topic, select_part=None):
    for (
        part,
        topic_n_preferences_by_measure_topic,
    ) in topic_n_preferences_by_part_measure_topic.items():
        for (
            measure,
            topic_n_preferences_by_topic,
        ) in topic_n_preferences_by_measure_topic.items():
            for topic_id, preference in topic_n_preferences_by_topic.items():
                # print(topic_id, preference)
                topic_n_preferences_by_part_measure_topic[part][measure][topic_id] = (
                    1 if select_part is None or part == select_part else 0
                )


class TestInit(TestCase):
    def test_init0(self):
        print("test_init0")
        from route.projects.songs.choose_sound import get_topic_preferences_by_topic_n
        from sqls.topic_preferences import init_topic_preferences
        from sqls.user import add_user_by_firebase_id

        firebase_id = "test"
        try:
            add_user_by_firebase_id(firebase_id)
            init_topic_preferences(firebase_id)
        except UniqueViolation:
            pass

        topic_n_preferences_by_part_measure_topic = get_topic_preferences_by_topic_n(
            firebase_id
        )
        init0(topic_n_preferences_by_part_measure_topic)
        for (
            topic_n_preferences_by_measure_topic
        ) in topic_n_preferences_by_part_measure_topic.values():
            for (
                topic_n_preferences_by_topic
            ) in topic_n_preferences_by_measure_topic.values():
                for preference in topic_n_preferences_by_topic.values():
                    self.assertEqual(preference, 0)

    def test_init1(self):
        print("test_init1")
        from route.projects.songs.choose_sound import get_topic_preferences_by_topic_n
        from sqls.topic_preferences import init_topic_preferences
        from sqls.user import add_user_by_firebase_id

        parts = get_parts()

        firebase_id = "test"
        try:
            add_user_by_firebase_id(firebase_id)
            init_topic_preferences(firebase_id)
        except UniqueViolation:
            pass

        topic_n_preferences_by_part_measure_topic = get_topic_preferences_by_topic_n(
            firebase_id
        )

        for part in parts:
            init1(topic_n_preferences_by_part_measure_topic, select_part=part["id"])
            for (
                part_id,
                topic_n_preferences_by_measure_topic,
            ) in topic_n_preferences_by_part_measure_topic.items():
                for (
                    topic_n_preferences_by_topic
                ) in topic_n_preferences_by_measure_topic.values():
                    for preference in topic_n_preferences_by_topic.values():
                        self.assertEqual(preference, 1 if part_id == part["id"] else 0)

        init1(topic_n_preferences_by_part_measure_topic)
        for (
            topic_n_preferences_by_measure_topic
        ) in topic_n_preferences_by_part_measure_topic.values():
            for (
                topic_n_preferences_by_topic
            ) in topic_n_preferences_by_measure_topic.values():
                for preference in topic_n_preferences_by_topic.values():
                    self.assertEqual(preference, 1)


class TestMakeRandomSound(TestCase):

    def test_get_topicpreferences(self):
        print("test_get_topicpreferences")
        from route.projects.songs.choose_sound import get_topic_preferences_by_topic_n
        from sqls.topic_preferences import init_topic_preferences
        from sqls.user import add_user_by_firebase_id

        firebase_id = "test"
        try:
            add_user_by_firebase_id(firebase_id)
            init_topic_preferences(firebase_id)
        except UniqueViolation:
            pass

        topic_n_preferences_by_part_measure_topic = get_topic_preferences_by_topic_n(
            firebase_id
        )
        init0(topic_n_preferences_by_part_measure_topic)

        parts = get_parts()
        parts = sorted(parts, key=lambda x: part_name2index[x["name"]])

        for part in parts:
            sound_list = choose_sound_randomly_with_using_ratio_topic(
                part["id"],
                topic_n_preferences_by_part_measure_topic[part["id"]],
            )
            self.assertEqual(sound_list, [])

        for _part in parts:
            init1(topic_n_preferences_by_part_measure_topic, select_part=_part["id"])
            # pp.pprint(topic_n_preferences_by_part_measure_topic[_part["id"]])
            print("get part loop values", _part["id"])
            print(get_part_loop_values(_part["id"]))

            for part in parts:
                # print(
                #     part["id"],
                #     _part["id"],
                #     topic_n_preferences_by_part_measure_topic[part["id"]],
                # )
                sound_list = choose_sound_randomly_with_using_ratio_topic(
                    part["id"],
                    topic_n_preferences_by_part_measure_topic[part["id"]],
                )
                # print(part, _part, sound_list)
                # if part["id"] == _part["id"]:
                #     self.assertNotEqual(sound_list, [])
                # else:
                self.assertEqual(sound_list, [])

        sound_list = choose_sound_randomly(firebase_id)
        print(sound_list)
