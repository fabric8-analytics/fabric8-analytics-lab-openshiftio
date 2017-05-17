from flask import Flask, request, Response, json, jsonify
from flask_socketio import SocketIO, emit, disconnect
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app)


@app.route('/package-search', methods=['GET'])
def handle_component_list():
    package = request.args.get('package')
    with open('component-list.json') as component_list:
        component_list_data = json.load(component_list)
    response = Response(json.dumps(component_list_data), status=200,
                        mimetype='application/json')
    return response


@socketio.on('get_component_analyses', namespace='/component-analyses')
def handle_component_analyses(msg):
    with open('component-analysis.json') as component_analysis:
        component_analyses_data = json.load(component_analysis)
    with open('component-sentiment.json') as component_sentiment:
        component_sentiment_data = json.load(component_sentiment)
    emit('component-analyses-response', json.dumps(component_analyses_data))
    emit('component-sentiment-response', json.dumps(component_sentiment_data))
    disconnect()


@socketio.on_error_default
def error_handler(e):
    print('An error has occurred: ' + str(e))


@socketio.on_error(namespace='/component-analyses')
def component_analyses_error_handler(e):
    print('An error has occurred in component analyses: ' + str(e))


@socketio.on('disconnect', namespace='/component-analyses')
def test_disconnect():
    print('Client disconnected')


if __name__ == "__main__":
    socketio.run(app, port=5012)
