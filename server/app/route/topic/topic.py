from flask import Blueprint, jsonify, make_response
from util import const

topic = Blueprint("topic", __name__)


@topic.route("/topic", methods=["GET"])
def get_topic_preference():
    ratio_topic = load_topic_preference(const.topic_n)
    response = {"ratio-topic": ratio_topic}

    return make_response(jsonify(response))


# TODO: パートごと，盛り上がり度ごとのトピック選好度をデータベースから取得
def load_topic_preference(topic_n=4):
    ratio_topic = [[[1.0 for i in range(topic_n)] for j in range(5)] for k in range(4)]
    part_list = ["Drums", "Bass", "Synth", "Sequence"]
    for i in range(4):
        for j in range(5):
            pass_ratio_topic = (
                "./lda/" + part_list[i] + "/ratio_topic" + str(j) + ".txt"
            )
            topic = []
            with open(pass_ratio_topic) as f:
                topic = f.read().split("\n")
            for k in range(4):
                ratio_topic[i][j][k] = float(topic[k])

    return ratio_topic
