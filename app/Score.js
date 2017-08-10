import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default class Score extends React.PureComponent {
  props: {};

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.scoreContainer}>
          <Text style={styles.selfText}>
            {'You'}
          </Text>
          <Text style={styles.selfText}>
            {100}
          </Text>
        </View>
        <View style={styles.scoreContainer}>
          <Text style={styles.timerText}>
            {'Time left'}
          </Text>
          <Text style={styles.timerText}>
            {'00:30'}
          </Text>
        </View>
        <View style={styles.scoreContainer}>
          <Text style={styles.opponentText}>
            {'Opponent'}
          </Text>
          <Text style={styles.opponentText}>
            {300}
          </Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 0.2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingBottom: 30,
  },
  scoreContainer: {
    flex: 1,
    alignItems: 'center',
  },
  selfText: {
    color: 'green',
  },
  opponentText: {
    color: 'red',
  },
  timerText: {},
});
