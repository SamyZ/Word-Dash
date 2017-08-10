import React from 'react';
import { StyleSheet, Text, TouchableHighlight } from 'react-native';

export default class LetterBox extends React.PureComponent {
  props: {
    letter: string,
    onPress: Function,
    size: number,
    index: number,
    active: boolean,
  };

  handlePress = () => {
    this.props.onPress(this.props.letter, this.props.index, !this.props.active);
  };

  render() {
    return (
      <TouchableHighlight
        style={currentStyles(this.props.size, this.props.active).container}
        onPress={this.handlePress}
        underlayColor="powderblue"
      >
        <Text style={styles.letter}>
          {this.props.letter}
        </Text>
      </TouchableHighlight>
    );
  }
}

const currentStyles = (size, active) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      borderColor: 'skyblue',
      borderWidth: 1,
      width: size,
      height: size,
      backgroundColor: active ? 'powderblue' : 'white',
    },
  });

const styles = StyleSheet.create({
  letter: {
    fontSize: 40,
  },
});
