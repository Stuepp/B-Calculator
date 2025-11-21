import { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

const buttons = [
  ['C', '(', ')', '%'], // First row of buttons
  ['7', '8', '9', '/'], // Second row of buttons
  ['4', '5', '6', '*'], // Third row of buttons
  ['1', '2', '3', '-'], // Fourth row of buttons
  ['+/-', '0', '.', '+'], // Fifth row of buttons
  ['='], // Sixth row with only the equals button
];

export default function Index() {
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');

  useEffect(() => {
    try{
      if(input){
        let finalInput = input.replace(/x/g, '*').replace(/÷/g, '/');
        const evalResult = eval(finalInput);
        setResult(evalResult.toString());
      } else {
        setResult('');
      }
    } catch (e) {
      setResult('');
    }
  }, [input])

  const handlePress = (btn:string) => {
    if (btn === 'C') {
      setInput('');
      setResult('');
    } else if (btn === '+/-'){
      if(input.startsWith('-')) setInput(input.substring(1));
      else setInput('-' + input)
    } else {
      setInput((prev) => prev + btn);
    }
  };

  return(
    <View style={styles.container}>
      {/* Display for input and result */}
      <ScrollView style={{maxHeight: 160, flex: 1}}>
        <View style={styles.resultContainer}>
          <Text style={styles.inputText}>{input + ' '}</Text>
        </View>
      </ScrollView>
      <ScrollView style={{maxHeight: 160, flex: 1}}>
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>{result + ' '}</Text>
        </View>
      </ScrollView>
      {/* Calculator buttons */}
      <View style={styles.buttonContainer}>
        {buttons.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((btn, colIndex) => (
              <TouchableOpacity
                key={colIndex}
                style={[
                  styles.button,
                  btn === '=' ? styles.equalsButton : null,
                ]}
                onPress={() => handlePress(btn)}
              >
                <Text style={[styles.buttonText, btn === '=' && {fontSize:28}]}>
                  {btn}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))
        }
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'flex-start',
  },
  resultContainer: {
    padding: 50,
    maxHeight: 160,
    alignItems: 'flex-end',
  },
  inputText: {
    fontSize: 36,
    color: '#AFAFAF',
  },
  resultText: {
    fontSize: 40,
    color: '#fff',
    marginTop: 10,
  },
  buttonContainer: {
    padding: 10,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 6
  },
  button: {
    backgroundColor: '#1c1c1c',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 5,
    height: 70,
    borderRadius: 35,
  },
  equalsButton: {
    backgroundColor: '#1fd660',
    flex: 4,
  },
  buttonText:{
    fontSize: 24,
    color: '#fff',
  }
});