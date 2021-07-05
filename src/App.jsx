import React, {useState, useEffect} from 'react';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Admin from './components/Admin';
import Reset from './components/Reset';
import {auth} from './firebase';


function App() {

    const [firebaseUser, setFirebaserUser] = useState(false)

    useEffect(() => {
    auth.onAuthStateChanged(user => {
        console.log(user);
        if(user){
            setFirebaserUser(user);
        }else{
            setFirebaserUser(null)
        }
    })
    }, []);

  return firebaseUser !== false ? (
    <Router>
            <div className="container">
                <Navbar firebaseUser={firebaseUser} />
                <Switch>
                    <Route path="/login">
                        <Login/>
                    </Route>
                    <Route path="/admin">
                        <Admin/>
                    </Route>
                    <Route path="/reset" exact>
                      <Reset />
                    </Route>
                    <Route path="/" exact>
                        <h1 className="text-center">Hola! Hace loguin y crea tu lista de tareas </h1>
                    </Route>
                </Switch>
            </div>
    </Router>
    ) : (
        <p>Cargando...</p>
    )
}

export default App;
