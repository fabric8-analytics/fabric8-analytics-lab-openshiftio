from flask import Flask
from flask_socketio import SocketIO, emit, disconnect
import json

app = Flask(__name__)
socketio = SocketIO(app)
thread = None

with open('component-list.json') as component_list:    
    component_list_data = json.load(component_list)

with open('component-analysis.json') as component_analysis:    
    component_analysis_data = json.load(component_analysis)

with open('component-sentiment.json') as component_sentiment:    
    component_sentiment_data = json.load(component_sentiment)

def get_component_list():
    return component_list_data

def get_component_analyses():
    return component_analysis_data

def get_component_sentiment():
    return component_sentiment_data

@socketio.on('get_component_list', namespace='/component-list')
def handle_component_list(msg):
    print(msg);
    component_list_data = get_component_list()
    emit('component-list-response', json.dumps({'result': component_list_data}))
    disconnect()

@socketio.on('get_component_analyses', namespace='/component-analyses')
def handle_component_analyses(msg):
    print(msg);
    component_analyses_data = get_component_analyses()
    emit('component-analyses-response', json.dumps({'result': component_analyses_data}))
    component_sentiment_data = get_component_sentiment()
    emit('component-sentiment-response', json.dumps({'result': component_sentiment_data}))
    disconnect()

@socketio.on('disconnect')
def test_disconnect():
    print('Client disconnected')

if __name__ == "__main__":
    socketio.run(app, port=5012)
