import React from 'react';
import uuid from 'react-native-unique-id';
import { StyleSheet, Text, View } from 'react-native';
import { find, keys, equals } from 'ramda';
import moment from 'moment';
import TimerMixin from 'react-timer-mixin';

export default class Score extends React.PureComponent {
  props: {
    scores: Object,
    startTime: number,
    endTime: number,
  };

  state = { timeLeft: 0 };

  mixins: [TimerMixin];

  componentWillMount() {
    this.timer = setInterval(() => {
      const timeLeft = Math.round((this.props.endTime - Date.now()) / 1000);
      if (this.state.timeLeft !== timeLeft) {
        this.setState({ timeLeft });
      }
    }, 100);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.scoreContainer}>
          <Text style={styles.selfText}>{'You'}</Text>
          <Text style={styles.selfText}>{this.props.scores.self}</Text>
        </View>
        <View style={styles.scoreContainer}>
          <Text style={styles.timerText}>{'Time left'}</Text>
          <Text style={styles.timerText}>{this.state.timeLeft}</Text>
        </View>
        <View style={styles.scoreContainer}>
          <Text style={styles.opponentText}>{'Opponent'}</Text>
          <Text style={styles.opponentText}>{this.props.scores.opponent}</Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 0.1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingBottom: 10,
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
