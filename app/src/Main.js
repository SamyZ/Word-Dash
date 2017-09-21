import React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  TouchableNativeFeedback,
  TouchableOpacity,
} from 'react-native';
import { find, keys, equals, not, dissoc, values } from 'ramda';
import moment from 'moment';

import SocketIOClient from 'socket.io-client';
import uuid from 'react-native-unique-id';
import Game from './Game';

const GAME_DURATION = 0.5 * 60 * 1000; // 2 minutes

export default class Main extends React.Component {
  state = {
    game: false,
    letters: [],
    scores: { self: 0, opponent: 0 },
    startTime: moment(),
    loading: false,
  };

  constructor(props) {
    super(props);
    console.ignoredYellowBox = ['Setting a timer'];
    uuid().then(id => {
      this.state = { id };
      this.socket = SocketIOClient('http://172.23.0.54:3000');
      this.socket.on('connect', () => {
        this.socket.send(id);
      });
      // opponent: scores[find(not(equals(id)), keys(scores))]
      this.socket.on('game:started', ({ letters, scores, startTime, endTime }) => {
        this.setState({
          game: true,
          lettersGrid: letters,
          scores: { self: scores[id], opponent: values(dissoc(id, scores))[0] },
          startTime: Date.now(),
          endTime: Date.now() + GAME_DURATION,
          loading: false,
        });
      });
      this.socket.on('game:score', scores => {
        this.setState({
          scores: { self: scores[id], opponent: values(dissoc(id, scores))[0] },
        });
      });
      this.socket.on('game:over', scores => {
        this.setState({
          scores: { self: scores[id], opponent: values(dissoc(id, scores))[0] },
          game: false,
        });
      });
    });
  }

  handleStart = () => {
    this.socket.emit('game:ready', { userId: this.state.id });
    this.setState({ loading: true });
  };

  handleSend = word =>
    new Promise(resolve => {
      this.socket.emit('game:word', word.toLowerCase(), value => {
        resolve(value);
      });
    });

  handleCancel = () => {
    this.setState({ loading: false, game: false });
    this.socket.emit('game:readyCancel', { userId: this.state.id });
  };

  render() {
    const Touchable = Platform.OS === 'android' ? TouchableNativeFeedback : TouchableOpacity;

    if (this.state.loading) {
      return (
        <View style={styles.container}>
          <Text style={styles.loadingText}>{'Waiting for another player...'}</Text>
          <Touchable onPress={this.handleCancel} accessibilityLabel="cancel">
            <View style={styles.button}>
              <Text style={styles.buttonText}>{'CANCEL'}</Text>
            </View>
          </Touchable>
        </View>
      );
    }
    return (
      <View style={styles.container}>
        {this.state.game ? (
          <View style={styles.mainView}>
            <View style={styles.menuView}>
              <Touchable onPress={this.handleCancel} accessibilityLabel="start">
                <View style={styles.button}>
                  <Text style={styles.buttonText}>{'MENU'}</Text>
                </View>
              </Touchable>
            </View>
            <Game
              lettersGrid={this.state.lettersGrid}
              onSend={this.handleSend}
              scores={this.state.scores}
              startTime={this.state.startTime}
              endTime={this.state.endTime}
            />
          </View>
        ) : (
          <Touchable onPress={this.handleStart} accessibilityLabel="start">
            <View style={styles.button}>
              <Text style={styles.buttonText}>{'START'}</Text>
            </View>
          </Touchable>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuView: {
    flex: 0.1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
  },
  button: {
    elevation: 2,
    borderRadius: 5,
    backgroundColor: 'steelblue',
    width: 100,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '500',
    padding: 8,
  },
  loadingText: {
    fontSize: 20,
    color: 'steelblue',
    paddingBottom: 20,
  },
});
