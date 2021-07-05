import React, {useCallback, useState} from 'react';
import {auth, db} from '../firebase';
import { withRouter } from 'react-router-dom';



const Login = (props) => {

    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [error, setError] = useState(null);
    const [isSignUp, setIsSignUp] = useState(false)

    const processData = e => {
        e.preventDefault();
        if(!email.trim()){
            setError('Ingrese Email')
            return;
        }
        if(!pass.trim()){
            setError('Ingrese Password')
            return;
        }
        if(pass.length < 6){
            setError('Ingrese password mayor a 6 caracteres')
            return;
        }
       setError(null);

       if(isSignUp){
           signUp()
       }else{
           login();
       }
       
    }

    const login = useCallback(async() => {
        try {
           const res =  await auth.signInWithEmailAndPassword(email, pass)
           console.log(res.user);
           setEmail('');
           setPass('');
           setError(null);
           props.history.push('/admin');
        } catch (error) {
            console.log(error);
            if(error.code === 'auth/invalid-email'){
                setError('Email no valido')
            }
            if(error.code === 'auth/email-already-in-use'){
                setError('Email ya utilizado')
              }
            if(error.code === 'auth/user-not-found'){
                setError('Email no registrado')
              }
            if(error.code === 'auth/wrong-password'){
                setError('Password incorrecto')
              }
        }
    }, [email,pass,props.history])

    const signUp = useCallback(async() => {
        try {
         const res = await  auth.createUserWithEmailAndPassword(email, pass)
         await db.collection('users').doc(res.user.email).set({
             email: res.user.email,
             uid: res.user.uid
         })
         await db.collection(res.user.uid).add({
             name: 'Tarea de ejemplo',
             fecha: Date.now()
         })
         setEmail('');
         setPass('');
         setError(null);
         props.history.push('/admin');

        } catch (error) {
          console.log('error');  
          if(error.code === 'auth/invalid-email'){
            setError('Email no valido')
          }
          if(error.code === 'auth/email-already-in-use'){
            setError('Email ya utilizado')
          }
        
        }
    }, [email, pass, props.history])

    return (
        <div className="mt-5">
            <h3 className="text-center">
            {
                isSignUp ? 'Registro' : 'Login'
            }
            </h3>
            <hr/>
            <div className="row justify-content-center">
                <div className="col-12 col-sm-8 col-md-6 col-xl-4">
                    <form onSubmit={processData}>
                        {
                            error && (
                                <div className="alert alert-danger">
                                    {error}
                                </div>
                            )
                        }
                        <input 
                            type="email" 
                            className="form-control mb-2"
                            placeholder="Ingrese Email"
                            onChange={e => setEmail(e.target.value)}
                            value={email}
                        />
                        <input 
                            type="password" 
                            className="form-control mb-2"
                            placeholder="Ingrese Contraseña"
                            onChange={e => setPass(e.target.value)}
                            value={pass}
                        
                        />
                        <button 
                            className="btn btn-lg btn-dark btn-block"
                            type="submit"
                        >
                           {isSignUp ? 'Registrarse' : 'Acceder' }
                        </button>
                        <button 
                            className="btn btn-sm btn-info btn-block"
                            type="button"
                            onClick={()=>setIsSignUp(!isSignUp)}
                        >
                           {
                               isSignUp ? '¿Ya estas registrado?' : '¿No tenes una cuenta?'
                           }
                        </button>
                        {!isSignUp ? ( <button 
                            className="btn btn-lg btn-danger btn-sm mt-2 btn-block"
                            type="button"
                            onClick={() => props.history.push('/reset')}
                        >
                          Recuperar Contraseña
                        </button> ) : null}
                       
                    </form>
                </div>
            </div>
        </div>
    )
}

export default withRouter(Login)
