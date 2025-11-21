import { useState } from 'react';
import {Text, Pressable, View, StyleSheet} from 'react-native';

type Props = {
  number: string;
  theme?: 'primary';
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  setResult: React.Dispatch<React.SetStateAction<string>>;
};

export default function NumberBt({ number, theme, input, setInput, setResult }: Props) {
  const handlePress = (btn: string) => {
  if (btn === 'C') {
    setInput('');
    setResult('');
  } else if (btn === '=') {
    //
  } else if (btn === '+/-') {
    if(input.startsWith('-')) setInput(input.substring(1));
    else setInput('-' + input);
  } else {
    setInput((prev) => prev + btn);
  }
};
  
  
  if (theme === 'primary'){
      return (
      <View style={styles.button}>
        <Pressable onPress={() => handlePress(number)}>
          <Text style={styles.buttonText}>{number}</Text>
        </Pressable>
      </View>
    );
  } else {
    return (
      <View style={styles.equalsButton}>
        <Pressable onPress={() => handlePress(number)}>
          <Text style={styles.equalsbtText}>{number}</Text>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  button:{
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
  },
  equalsbtText:{
    fontSize: 40,
    color: '#fff',
    textAlign: 'center'
  },
});