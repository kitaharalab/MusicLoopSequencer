import firebase_admin
from cache import cache
from firebase_admin import credentials
from flask import Flask
from flask_cors import CORS
from route.music_parts import parts
from route.music_parts.id.music_loop import music_loop
from route.music_parts.id.sounds import sounds
from route.projects import projects
from route.projects.songs import songs
from route.projects.songs.music_parts import song_parts
from route.projects.songs.music_parts.measure import part_measure
from route.projects.songs.music_parts.measure.music_loop import mesure_music_loop
from route.topic import topic
from route.user import user

# from route.music_parts.id.sounds.id import sound_id


cred = credentials.Certificate("./credentials.json")
firebase_app = firebase_admin.initialize_app(cred)

app = Flask(__name__)
CORS(app)

app.register_blueprint(parts)
app.register_blueprint(sounds)
# app.register_blueprint(sound_id, url_prefix="/parts/<int:partid>/sounds/<int:soundid>")
app.register_blueprint(projects)
app.register_blueprint(songs)
app.register_blueprint(song_parts)
app.register_blueprint(part_measure)
app.register_blueprint(mesure_music_loop)
app.register_blueprint(topic)
app.register_blueprint(music_loop)
app.register_blueprint(user)

cache.init_app(app)


if __name__ == "__main__":
    app.run(debug=True, port=8080, threaded=True)
