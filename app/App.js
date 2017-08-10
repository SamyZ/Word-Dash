import React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  TouchableNativeFeedback,
  TouchableOpacity,
} from 'react-native';

import SocketIOClient from 'socket.io-client';
import uuid from 'react-native-unique-id';
import Game from './Game';

export default class App extends React.Component {
  state = { game: false, letters: [] };
  constructor(props) {
    super(props);
    uuid().then(id => {
      this.state = { id };
      this.socket = SocketIOClient('http://172.23.0.200:3000');
      this.socket.on('start', ({ letters }) => {
        this.setState({ game: true, letters });
        this.setTimeout(() => {
          this.setState({ game: false }), 5000;
        });
      });
    });
  }

  handleStart = () => {
    this.socket.emit('game:start', this.state.id);
  };

  render() {
    const Touchable = Platform.OS === 'android' ? TouchableNativeFeedback : TouchableOpacity;
    return (
      <View style={styles.container}>
        {this.state.game
          ? <Game letters={this.state.letters} />
          : <Touchable onPress={this.handleStart} accessibilityLabel="send word">
              <View style={styles.button}>
                <Text style={styles.buttonText}>
                  {'START'}
                </Text>
              </View>
            </Touchable>}
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
    padding: 10,
  },
});
