import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { isNil, find, equals } from 'ramda';
const { width } = Dimensions.get('window');

import LetterBox from './LetterBox';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const randomLetter = () => LETTERS[Math.floor(Math.random() * LETTERS.length)];

const lettersGrid = [];
for (let i = 0; i < 36; i++) {
  lettersGrid.push(randomLetter());
}

export default class Grid extends React.PureComponent {
  props: {
    onPress: Function,
    activeLetters: Array<string>,
    lettersGrid: Array<string>,
  };

  render() {
    return (
      <View style={styles.container}>
        {this.props.lettersGrid.map((letter, index) => (
          <LetterBox
            letter={letter}
            index={index}
            size={Math.floor(width * 0.15)}
            onPress={this.props.onPress}
            key={index}
            active={!isNil(find(equals(index), this.props.activeLetters))}
          />
        ))}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 0.8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    justifyContent: 'center',
    borderColor: 'skyblue',
    borderWidth: 1,
    width: Math.floor(width * 0.15) * 6 + 2,
    maxHeight: Math.floor(width * 0.15) * 6 + 2,
  },
});
