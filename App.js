import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, TextInput, View, FlatList } from 'react-native';
import { initializeApp } from "firebase/app";
import { getFirestore, addDoc, getDocs, collection } from "firebase/firestore";
import { useEffect, useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, getAuth, signOut } from 'firebase/auth';
import axios from 'axios';


const firebaseConfig = {
  apiKey: "AIzaSyD75I6WDNsIPGeShQqxWLCFN5eduAXqGv4",
  authDomain: "cp6-6c245.firebaseapp.com",
  projectId: "cp6-6c245",
  storageBucket: "cp6-6c245.firebasestorage.app",
  messagingSenderId: "52325890222",
  appId: "1:52325890222:web:cb040b4658eac7be87553f",
  measurementId: "G-K1BGNQV9G9"
};

export default function App() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const auth = getAuth(app);
  const [user, setUser] = useState(null)
  const [users, setUsers] = useState([])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [characters, setCharacters] = useState([]);
  const [favorites, setFavorites] = useState([]);

  const handleLogin = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        setUser(userCredential.user)
      })
      .catch(error => {
        console.log(error);
      })
  }

  const handleNewAccount = () => {
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        setUser(userCredential.user)
      })
      .catch(error => {
        console.log(error);
      })
  }
  const handleFavorites = async () => {
    try {
      const docRef = await addDoc(collection(db, "users"), {
        first: "Ada",
        last: "Lovelace",
        born: 1815
      });
      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }
  useEffect(() => {
    const getUsers = async () => {
      const querySnapshot = await getDocs(collection(db, "users"));
      let users = []
      querySnapshot.forEach((doc) => {
        users.push(doc.data().first)
      });
      setUsers(users)
    }
    getUsers()

  }, [])

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      db.collection('favorites').doc(user.uid).get()
        .then(doc => setFavorites(Object.values(doc.data() || {})))
        .catch(error => console.error(error));
    }
  }, []);

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        setUser(null)
      })
      .catch(error => {
        console.log(error);
      })
  }

  useEffect(() => {
    axios.get('https://rickandmortyapi.com/api/character')
      .then(response => setCharacters(response.data.results))
      .catch(error => console.error(error));
  }, []);


  return (
    <View style={styles.container}>
      <TextInput placeholder='Email' onChangeText={setEmail} />
      <TextInput placeholder='Senha' onChangeText={setPassword} />
      <Button title='Cadastrar' onPress={handleNewAccount} />
      <Button title='Login' onPress={handleLogin} />
      <View>
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View>
              <Text>{item.name}</Text>
            </View>
          )}
        />
      </View>
      <View>
        <FlatList
          data={characters}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View>
              <Text>{item.name}</Text>
              <Button title="Favoritar" onPress={setFavorites} />
            </View>
          )}
        />
      </View>
      {!user ? (
        <>

          <Text>Nenhum usuário logado</Text>
          {users.map((user, index) => (
            <Text key={index}>{user}</Text>
          ))}
        </>
      ) : (
        <View>

          <Text>{`usuário: ${user.email}`}</Text>

          <Button title='Sair' onPress={handleSignOut} />
        </View>

      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    justifyContent: 'center',
  },
});