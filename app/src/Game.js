import React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  TouchableNativeFeedback,
  TouchableOpacity,
} from 'react-native';
import { equals, find, findIndex, findLastIndex } from 'ramda';

import Score from './Score';
import Grid from './Grid';

export default class Game extends React.Component {
  props: {
    lettersGrid: Array<string>,
    onSend: Function,
    scores: Object,
    startTime: Object,
  };

  state = { letters: [], notification: null, activeLetters: [] };

  handleSend = () => {
    this.props.onSend(this.state.letters.join('')).then(value => {
      switch (value) {
        case 'OK':
          this.setState({
            letters: [],
            activeLetters: [],
            notification: { message: 'You found a word!', type: 'success' },
          });
          break;
        case 'TAKEN':
          this.setState({
            letters: [],
            activeLetters: [],
            notification: { message: 'Word already taken!', type: 'error' },
          });
          break;
        case 'INVALID':
          this.setState({
            letters: [],
            activeLetters: [],
            notification: { message: 'Invalid word!', type: 'error' },
          });
          break;
        default:
          break;
      }
    });
  };

  onPress = (letter, index, active) => {
    const letters = this.state.letters.slice();
    const activeLetters = this.state.activeLetters.slice();
    if (active) {
      letters.push(letter);
      activeLetters.push(index);
    } else {
      letters.splice(findLastIndex(equals(letter), letters), 1);
      activeLetters.splice(findIndex(equals(index), activeLetters));
    }
    this.setState({
      letters,
      notification: null,
      activeLetters,
    });
  };

  render() {
    const Touchable = Platform.OS === 'android' ? TouchableNativeFeedback : TouchableOpacity;
    return (
      <View>
        <Score scores={this.props.scores} startTime={this.props.startTime} />
        <Grid
          onPress={this.onPress}
          lettersGrid={this.props.lettersGrid}
          activeLetters={this.state.activeLetters}
        />
        <View style={styles.inputContainer}>
          <View style={styles.lettersContainer}>
            {this.state.notification
              ? <Text style={notificationStyles(this.state.notification.type).notification}>
                  {this.state.notification.message}
                </Text>
              : <Text style={styles.letters}>
                  {this.state.letters.length ? this.state.letters.join('') : ' '}
                </Text>}
          </View>
          <Touchable
            onPress={this.handleSend}
            accessibilityLabel="send word"
            disabled={!this.state.letters}
          >
            <View style={styles.button}>
              <Text style={styles.buttonText}>
                {'SEND'}
              </Text>
            </View>
          </Touchable>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  inputContainer: {
    flex: 0.3,
    alignItems: 'center',
  },
  lettersContainer: {
    padding: 20,
  },
  letters: {
    fontSize: 25,
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

const notificationStyles = type =>
  StyleSheet.create({
    notification: {
      color: type === 'success' ? 'green' : 'red',
      fontSize: 25,
    },
  });
