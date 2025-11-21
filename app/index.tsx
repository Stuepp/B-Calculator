import { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, ScrollView, StyleSheet, FlatList } from 'react-native';

const buttons = [
  ['C', '(', ')', '%'], // First row of buttons
  ['7', '8', '9', '/'], // Second row of buttons
  ['4', '5', '6', '*'], // Third row of buttons
  ['1', '2', '3', '-'], // Fourth row of buttons
  ['+/-', '0', '.', '+'], // Fifth row of buttons
  ['='], // Sixth row with only the equals button
];

type Moeda = {
  simbolo: string;
  nomeFormatado: string;
  tipoMoeda: string;
};

const REAL:Moeda = {
  simbolo:'BRL',
  nomeFormatado:'Real Brasileiro',
  tipoMoeda:'Nacional',
}

export default function Index() {
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');

  const [moedas, setMoedas] = useState<Moeda[]>([]);
  const [selectedMoeda, setSelectedMoeda] = useState<Moeda>(REAL);
  const [selectedMoeda2, setSelectedMoeda2] = useState<Moeda>(REAL);

  const [resultadoConvertido, setResultadoConvertido] = useState<string>('');

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

  useEffect(() => {
    async function loadMoedas() {
      const resultado = await fetchMoedas();
      setMoedas(resultado);
    }
    loadMoedas();
  }, []);

  useEffect(() => {
    async function calcularConversao() {
      if (!selectedMoeda || !selectedMoeda2 || !result){
        setResultadoConvertido('');
        return;
      }

      const valor = await converterEntreMoedas(
        selectedMoeda.simbolo,
        selectedMoeda2.simbolo,
        Number(result)
      );

      setResultadoConvertido(String(valor));
    }

    calcularConversao();
  }, [selectedMoeda, selectedMoeda2, result]);

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

  async function fetchMoedas() {
    const url = 'https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/Moedas?$format=json'
    const response = await fetch(url);
    const data = await response.json();

    return [REAL, ...data.value];
  }

  async function getCotacaoHoje(simbolo: string) {
  
    if(simbolo === 'BRL') return 1;

    const hoje = new Date();
    const data = hoje.toLocaleDateString('en-US'); // MM/DD/YYYY

    const [mes, dia, ano] = data.split('/');
    const dataBCB = `${mes}-${dia}-${ano}`;

    const url = `https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/` +
              `CotacaoMoedaDia(moeda='${simbolo}',dataCotacao='${dataBCB}')?$format=json`;

    const response = await fetch(url);
    const json = await response.json();

    if(!json.value || json.value.length === 0){
      return null;
    }
    const utilmaCotacao = json.value[json.value.length - 1];

    // A PTAX usa "cotacaoCompra" e "cotacaoVenda"
    return utilmaCotacao.cotacaoVenda;
  }


  async function converterEntreMoedas(origem:string, destino:string, valor: number) {
    const cotacaoOrigem = await getCotacaoHoje(origem);
    const cotacaoDestino = await getCotacaoHoje(destino);

    if(cotacaoOrigem == null || !cotacaoDestino == null ) return null;

    // Se origem é BRL, a cotação é 1
    // Se destino é BRL, a cotação é 1
    const cOrigem = origem === 'BRL' ? 1 : cotacaoOrigem;
    const cDestino = destino === 'BRL' ? 1 : cotacaoDestino;

    // Converte origem em BRL
    const emBRL = valor * cOrigem;

    // Converte BRL em destino
    console.log(emBRL / cotacaoDestino)
    return emBRL / cDestino;
  }

  return(
    <View style={styles.container}>
      {/* Display for input and result */}
      <View style={{flex:1, flexDirection:'row'}}>
        <View style={{flex:1}}>
          {selectedMoeda && (
            <Text style={{color: '#fff', fontSize: 20, marginBottom: 10}}>
              {selectedMoeda.simbolo} - {selectedMoeda.nomeFormatado}
            </Text>
          )}
          <FlatList
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingVertical: 5, alignItems: 'center' }}
            data={moedas}
            keyExtractor={(item) => item.simbolo}
            renderItem={({item}) => (
              <TouchableOpacity
                onPress={() => setSelectedMoeda(item)}
                style={{
                  padding: 10,
                  backgroundColor: selectedMoeda?.simbolo === item.simbolo ? '#1fd660' : '#222',
                  marginVertical: 4,
                  borderRadius: 6,
                }}
              >
                <Text style={{color: '#fff'}}>{item.simbolo}</Text>
              </TouchableOpacity>
            )}
          />
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
        </View>
        <View style={{flex:1}}>
          {selectedMoeda2 && (
            <Text style={{color: '#fff', fontSize: 20, marginBottom: 10}}>
              {selectedMoeda2.simbolo} - {selectedMoeda2.nomeFormatado}
            </Text>
          )}
          <FlatList
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingVertical: 5, alignItems: 'center' }}
            data={moedas}
            keyExtractor={(item) => item.simbolo}
            renderItem={({item}) => (
              <TouchableOpacity
                onPress={() => setSelectedMoeda2(item)}
                style={{
                  padding: 10,
                  backgroundColor: selectedMoeda2?.simbolo === item.simbolo ? '#1fd660' : '#222',
                  marginVertical: 4,
                  borderRadius: 6,
                }}
              >
                <Text style={{color: '#fff'}}>{item.simbolo}</Text>
              </TouchableOpacity>
            )}
          />
          <ScrollView style={{maxHeight: 160, flex: 1}}>
            <View style={styles.resultContainer}>
              <Text style={styles.inputText}>{input + ' '}</Text>
            </View>
          </ScrollView>
          <ScrollView style={{maxHeight: 160, flex: 1}}>
            <View style={styles.resultContainer}>
              <Text style={styles.resultText}>{result + ' '}</Text>
              
              <Text style={styles.resultText}>{resultadoConvertido + ' '}</Text>
            </View>
          </ScrollView>
        </View>
      </View>
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
    //maxHeight: 160,
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