import React from 'react';
import { FlatList, StyleSheet } from 'react-native';

import EditScreenInfo from '../components/EditScreenInfo';
import { Text, View } from '../components/Themed';
import GLOBAL from '../global.js'

import firestore from '@react-native-firebase/firestore';
import { LineChart } from "react-native-gifted-charts";

export default class ReviewScreen extends React.Component {

  graphData = new Array();
  graphData2 = new Array();
  
  constructor(props) {
    super(props);
    this.state = {weightsList: null, MA15: 0};
  }

  componentDidMount() {
    this.getData();
  }

  getData() {
    if( GLOBAL.reloadData == false ) {
      return;
    }
    GLOBAL.reloadData = false; // this doesn't work, component does not reloads data on show

    firestore()
    .collection(GLOBAL.dbPrefix+'Weights')
    .limit(100)
    .orderBy('date', 'desc')
    .get()
    .then(querySnapshot => {
      let list = new Array();
      let maData = new Array();
      let grData = new Array();
      querySnapshot.forEach(documentSnapshot => {
        let d = documentSnapshot.data()['date'].toDate()
        let w = parseFloat(documentSnapshot.data()['weight']);
        list.push({
          'date': d.toLocaleString(), 
          'weight': w
        });
        let yy = d.getYear();
        let dd = d.getDate();
        let mm = d.getMonth()+1; 
        grData.push({
          'label': dd+"/"+mm, 
          'dataPointText': w+" at "+dd+"/"+mm+"/"+yy,
          'value': w
        });
        
        let ma = 0;
        let sum = 0;
        let limit = 50;
        if(grData.length > limit) {
          for(let x=1 ; x<=limit ; x++) {
            sum += grData[grData.length-x]['value'];
          }
          ma = sum/limit;
        }
        if (ma > 0) {
          maData.push({
            'label': dd+"/"+mm, 
            'dataPointText': ma+" at "+dd+"/"+mm+"/"+yy,
            'value': ma
          })
        }
      });
      
      this.graphData = grData;
      this.graphData2 = maData;

      let ma15 = 0;
      let sum = 0;
      let limit = 15;
      if(list.length < 15) limit = list.length;
      for(let x=0 ; x<limit ; x++) {
        sum += list[x]['weight'];
      }
      ma15 = sum/limit;

      let ma50 = 0;
      limit = 50;
      sum = 0;
      if(list.length < 50) limit = list.length;
      for(let x=0 ; x<limit ; x++) {
        sum += list[x]['weight'];
      }
      ma50 = sum/limit;
      
      this.setState({weightsList: list, MA15: ma15, MA50: ma50});
      // this.calculateStats();
    });

  }

  calculateStats() {
    let data = this.state.weightsList;
    const dates = this.getDates(data[data.length-1]['date'], data[0]['date'])
    
    dates.forEach(function (date) {  
      let foundRecord = false;
      for(let x=0 ; x<data.length ; x++) {
        let e = data[x]
        if (new Date(e['date']).setHours(0, 0, 0, 0) == date.setHours(0, 0, 0, 0)) {
          console.log(date, e['weight']);
          break
        }
      }

      if(foundRecord == false) {

      }
      
    })
  }

  getDates(startDate, endDate) {
    startDate = new Date(startDate.valueOf())
    endDate = new Date(endDate.valueOf())
    const dates = [];
    let currentDate = startDate;
    while (currentDate <= endDate) {
      dates.push(currentDate)
      currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1))
    }
    
    return dates
  } 

  render() {
    this.getData();

    return (
      <View style={styles.container}>
        <LineChart 
          data={this.graphData}
          data2={this.graphData2}
          rotateLabel
          spacing={30}
          pressEnabled
          showTextOnPress
          showFractionalValues
          yAxisOffset={this.state.MA50-5}
          textFontSize={15}
        />
        <Text>MA15: {this.state.MA15} ; MA50: {this.state.MA50}</Text>
        <FlatList
          data={this.state.weightsList}
          renderItem={({item}) => <Text style={styles.item}>{item['date']} =&gt; {item['weight']}</Text>}
        />
      </View>
    )
  }
}



const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 30,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  item: {
    padding: 10,
    fontSize: 18,
    height: 44,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
