import { Button, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import React, { useEffect } from 'react';

import EditScreenInfo from '../components/EditScreenInfo';
import { Text, View } from '../components/Themed';
import GLOBAL from '../global.js'
import { RootTabScreenProps } from '../types';

import InputSpinner from 'react-native-input-spinner';
import { createIconSetFromFontello } from '@expo/vector-icons';
import firestore from '@react-native-firebase/firestore';

export default class RecordScreen extends React.Component {

  constructor(props) {
    super(props);
    this.state = {weightValue: null, shouldShow: false};
    
    firestore()
    .collection(GLOBAL.dbPrefix+'Weights')
    .limit(1)
    .orderBy('date', 'desc')
    .get()
    .then(querySnapshot => {
      querySnapshot.forEach(documentSnapshot => {
        this.setState({weightValue: documentSnapshot.data()['weight']});
      }); 
    });


  }

  onChangeHandler(num) {
    this.setState({ weightValue: num });
  }

  onFormSubmit() {
    firestore()
    .collection(GLOBAL.dbPrefix+'Weights')
    .add({
      weight: this.state.weightValue,
      date: new Date(),
    })
    .then(() => {
      GLOBAL.reloadData = true;
      this.setState({ shouldShow: true });
      setTimeout(() => {this.setState({ shouldShow: false })}, 1000);
    });
  }

  render() {
    return (
      <>
        
        <Text>Weight:</Text>
        <InputSpinner
          step={0.1}
          value={this.state.weightValue}
          precision={1}
          type={"real"}
          onChange={(num) => {this.onChangeHandler(num)}}
        />

        <Button title="Submit" onPress={() => this.onFormSubmit()}/>
        { this.state.shouldShow &&
            <Text>Success</Text>
        }
      </>
    )
  }
}

