import { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, ScrollView, StyleSheet, FlatList } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';

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
    const dayOfWeek = hoje.getDay();
    const data = hoje.toLocaleDateString('en-US'); // MM/DD/YYYY

    let [mes, dia, ano] = data.split('/');
    
    if (dayOfWeek === 6){ // Sataturday
      dia = (Number(dia)-1).toString();
    }else if (dayOfWeek === 0){ // Sunday
      dia = (Number(dia)-2).toString();
    }

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
    return emBRL / cDestino;
  }

  const moedasDropDown = moedas.map((m) => ({
    label: `${m.simbolo} - ${m.nomeFormatado}`,
    value: m.simbolo
  }))

  const [value, setValue] = useState(null);
  const [isFocus, setIsFocus] = useState(false);
  const [value2, setValue2] = useState(null);
  const [isFocus2, setIsFocus2] = useState(false);

  return(
    <View style={styles.container}>
      {/* Display for input and result */}
      <View style={{flex:1, flexDirection:'row'}}>
        <View style={{flex:1}}>
          <Dropdown
            style={[styles.dropdown, isFocus && { borderColor: 'blue' }]}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.inputSearchStyle}
            iconStyle={styles.iconStyle}
            data={moedasDropDown}
            search
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder={!isFocus ? 'Select item' : '...'}
            searchPlaceholder="Search..."
            value={value}
            onFocus={() => setIsFocus(true)}
            onBlur={() => setIsFocus(false)}
            onChange={item => {
              setValue(item.value);
              setIsFocus(false);
              const moedaSelecionada = moedas.find(m => m.simbolo === item.value);
              if (moedaSelecionada) {
                setSelectedMoeda(moedaSelecionada);
              }
            }}
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
          <Dropdown
            style={[styles.dropdown, isFocus && { borderColor: 'blue' }]}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.inputSearchStyle}
            iconStyle={styles.iconStyle}
            data={moedasDropDown}
            search
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder={!isFocus ? 'Select item' : '...'}
            searchPlaceholder="Search..."
            value={value2}
            onFocus={() => setIsFocus2(true)}
            onBlur={() => setIsFocus2(false)}
            onChange={item => {
              setValue2(item.value);
              setIsFocus2(false);
              const moedaSelecionada2 = moedas.find(m => m.simbolo === item.value);
              if (moedaSelecionada2) {
                setSelectedMoeda2(moedaSelecionada2);
              }
            }}
          />
          <ScrollView style={{maxHeight: 160, flex: 1}}>
            <View style={styles.resultContainer}>
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
    paddingTop: 40,
  },
  resultContainer: {
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
  },
  dropdown: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginHorizontal: 8,
  },
  placeholderStyle: {
    fontSize: 16,
    color: '#fff',
  },
  selectedTextStyle: {
    fontSize: 16,
    color: '#fff',
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
});