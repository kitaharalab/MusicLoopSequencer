#!/usr/bin/env bash
echo $FIREBASE_CONFIG > credentials.json
flask run