import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';

const { width } = Dimensions.get('window');

import LetterBox from './LetterBox';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const randomLetter = () => LETTERS[Math.floor(Math.random() * LETTERS.length)];

const letterGrid = [];
for (let i = 0; i < 36; i++) {
  letterGrid.push(randomLetter());
}

export default class Grid extends React.PureComponent {
  props: {
    onPress: Function,
  };

  render() {
    return (
      <View style={styles.container}>
        {letterGrid.map((letter, index) =>
          <LetterBox
            letter={letter}
            size={Math.floor(width * 0.16)}
            onPress={this.props.onPress}
            key={index}
          />
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    justifyContent: 'center',
    borderColor: 'skyblue',
    borderWidth: 1,
    width: Math.floor(width * 0.16) * 6 + 2,
    maxHeight: Math.floor(width * 0.16) * 6 + 2,
  },
});
