import React from 'react';
import uuid from 'react-native-unique-id';
import { StyleSheet, Text, View } from 'react-native';
import { find, keys, equals } from 'ramda';
import moment from 'moment';
import TimerMixin from 'react-timer-mixin';

export default class Score extends React.PureComponent {
  props: {
    scores: Object,
    startTime: Object,
  };

  state = { timeLeft: 60 };

  mixins: [TimerMixin];

  componentDidMount() {
    setInterval(() => {
      this.setState({ timeLeft: Math.round(60 - moment().diff(this.props.startTime) / 1000) });
    }, 100);
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.scoreContainer}>
          <Text style={styles.selfText}>
            {'You'}
          </Text>
          <Text style={styles.selfText}>
            {this.props.scores.self}
          </Text>
        </View>
        <View style={styles.scoreContainer}>
          <Text style={styles.timerText}>
            {'Time left'}
          </Text>
          <Text style={styles.timerText}>
            {this.state.timeLeft}
          </Text>
        </View>
        <View style={styles.scoreContainer}>
          <Text style={styles.opponentText}>
            {'Opponent'}
          </Text>
          <Text style={styles.opponentText}>
            {this.props.scores.opponent}
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
