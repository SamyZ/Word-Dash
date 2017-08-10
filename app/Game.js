import React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  TouchableNativeFeedback,
  TouchableOpacity,
} from 'react-native';
import { equals, findLastIndex } from 'ramda';

import Score from './Score';
import Grid from './Grid';

export default class Game extends React.Component {
  state = { letters: [] };
  // constructor(props) {
  //   super(props);
  //   state = { letters: props.letters };
  // }

  onPress = (letter, active) => {
    const letters = this.state.letters.slice();
    if (active) {
      letters.push(letter);
    } else {
      letters.splice(findLastIndex(equals(letter), letters), 1);
    }
    this.setState({ letters });
  };

  render() {
    const Touchable = Platform.OS === 'android' ? TouchableNativeFeedback : TouchableOpacity;
    return (
      <View>
        <Score />
        <Grid onPress={this.onPress} />
        <View style={styles.inputContainer}>
          <View style={styles.lettersContainer}>
            <Text style={styles.letters}>
              {this.state.letters.length ? this.state.letters : ' '}
            </Text>
          </View>
          <Touchable
            onPress={() => {}}
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
