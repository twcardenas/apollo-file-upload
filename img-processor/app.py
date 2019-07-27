from flask import Flask, request
import os
from PIL import Image

app = Flask(__name__)

@app.route('/')
def index():
  return 'Server Works'

@app.route('/filter', methods=['POST'])
def hello():
  payload = request.get_json()

  for id in payload['ids']:
    im = Image.open('../server/images/' + id + '.jpg')
    im.save('../server/images/' + id + '.tiff')  # or 'test.tif'
  return 'halo'

